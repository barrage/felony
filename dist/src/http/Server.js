import hpp from "hpp";
import path from "path";
import cors from "cors";
import http from "http";
import https from "https";
import helmet from "helmet";
import Express from "express";
import userAgent from "express-useragent";
import FelonyServerReady from "../../support/events/FelonyServerReady.js";
import FelonyServerLoaded from "../../support/events/FelonyServerLoaded.js";
import FelonyServerListening from "../../support/events/FelonyServerListening.js";
import FelonyServerBeforeRouteCompile from "../../support/events/FelonyServerBeforeRouteCompile.js";
/**
 * Server instance that will load the routes and launch the server.
 *
 * @class
 */
export default class Server {
    /**
     * @param {Kernel} kernel
     */
    constructor(kernel) {
        /**
         * All the routes loaded
         *
         * @type {RouteInterface[]}
         */
        this.routes = [];
        /**
         * Server instance
         *
         * @type {Function}
         */
        this.application = Express();
        /**
         * Status of the HTTP server
         *
         * @type {string}
         */
        this.status = "pending";
        this.kernel = kernel;
    }
    /**
     * Load all defined routes within the framework and set them up for listening.
     *
     * @return {Promise<any>}
     */
    async load() {
        const routes = await this.kernel.readRecursive(path.resolve(this.kernel.felony.appRootPath, "routes"));
        for (const route of routes) {
            const Imported = (await import(route)).default;
            const Instance = new Imported(this.kernel.felony);
            let replacePath = `${this.kernel.felony.appRootPath}/`;
            let routeError = route;
            if (route.startsWith("file://")) { // adjusting the path depending on operating system
                replacePath = `file://${this.kernel.felony.appRootPath}\\`;
                routeError = path.normalize(route.replace("file://", ""));
            }
            Instance.__path = route.replace(replacePath, "");
            if (Instance && Instance.__kind === "Route") {
                if (["ALL", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"].indexOf(Instance.method.toUpperCase()) === -1) {
                    throw new Error(`Server: route '${routeError}': unknown method supplied: '${Instance.method}'`);
                }
                if (!Instance.path || Instance.path.startsWith("/") !== true) {
                    throw new Error(`Server: route '${routeError}': path defined '${Instance.path}' is not valid, path has to start with '/'`);
                }
                // This is the way to test loading of all the middleware during the application startup
                // we don't actually need them here, but we'll go ahead so we don't startup application
                // with faulty middleware.
                let middleware = await Instance.getMiddleware();
                middleware = null; // eslint-disable-line
                this.routes.push(Instance);
            }
            this.status = "loaded";
        }
    }
    /**
     * Launch the actual server that will listen to the incoming requests.
     *
     * @return {Promise<any>}
     */
    async serve() {
        await this.setupApplication();
        await this.kernel.felony.event.raise(new FelonyServerLoaded(this));
        this.router = Express.Router(this.kernel.felony.config.server.router || {});
        for (const route of this.routes) {
            const method = route.method.toLowerCase();
            const routePath = route.path;
            this.router[method](routePath, ...(await this.compileCallbacks(route)));
        }
        await this.kernel.felony.event.raise(new FelonyServerReady(this));
        this.application.use(this.router);
        if (typeof this.kernel.felony.config.server.https === "object" && this.kernel.felony.config.server.https) {
            this.server = https.createServer(this.kernel.felony.config.server.https, this.application);
        }
        else {
            this.server = http.createServer(this.application);
        }
        this.server.listen(this.kernel.felony.config.server.port, async () => {
            this.status = "listening";
            this.kernel.felony.log.log(`Server listening on port ${this.kernel.felony.config.server.port}`);
            await this.kernel.felony.event.raise(new FelonyServerListening(this));
        });
    }
    /**
     * Close the server listeners
     *
     * @param {number} [force] In seconds
     * @return {Promise<void>}
     */
    close(force = 300) {
        return new Promise((resolve) => {
            if (this.status === "listening") {
                this.kernel.felony.log.warn("Starting to close http(s) server...");
                // Force the shutdown after given number of seconds
                setTimeout(() => {
                    if (this.status !== "pending") {
                        this.kernel.felony.log.log("Server is taking to long to close connection, moving on...");
                        resolve();
                    }
                }, force * 1000);
                this.server.close(() => {
                    this.kernel.felony.log.log("Server connections closed, server terminated");
                    this.status = "pending";
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Internal runner for each route.
     *
     * @param {RouteInterface} route
     * @return {Promise<Function[]>}
     */
    async compileCallbacks(route) {
        await this.kernel.felony.event.raise(new FelonyServerBeforeRouteCompile(route));
        // Get all the middleware from the route and map them as
        // async callbacks for express route handler.
        const callbacks = (await route.getMiddleware())
            .map((middleware) => async (request, response, next) => {
            return middleware.handle(request, response, next);
        });
        // After we dealt with all the middleware, we attach at the end of
        // the callbacks our actual route handler method.
        callbacks.push(async (request, response) => {
            await route.handle(request, response);
        });
        return callbacks;
    }
    /**
     * Setup application before we start attaching routes and middleware to it.
     *
     * @return {Promise<void>}
     */
    async setupApplication() {
        this.kernel.felony.config.server = this.kernel.felony.config.server || {
            port: 5445,
        };
        if (this.kernel.felony.arguments.SERVER_PORT) {
            this.kernel.felony.config.server.port = this.kernel.felony.arguments.SERVER_PORT;
        }
        this.application.use(Express.json(this.kernel.felony.config.server.json || {}));
        if (this.kernel.felony.config.server.static && typeof this.kernel.felony.config.server.static === "object") {
            this.application.use(Express.static(this.kernel.felony.config.server.static));
        }
        if (this.kernel.felony.config.server.raw && typeof this.kernel.felony.config.server.raw === "object") {
            this.application.use(Express.raw(this.kernel.felony.config.server.raw));
        }
        // https://www.npmjs.com/package/express-useragent
        this.application.use(userAgent.express());
        // https://www.npmjs.com/package/hpp
        this.application.use(hpp({}));
        await this.setupHelmet();
        await this.setupCors();
    }
    /**
     * Setup helmet on the application with sane defaults.
     * https://helmetjs.github.io/
     *
     * @return {Promise<void>}
     */
    async setupHelmet() {
        if (!this.kernel.felony.config.server.helmet || typeof this.kernel.felony.config.server.helmet !== "object") {
            this.kernel.felony.config.server.helmet = {};
        }
        const H = this.kernel.felony.config.server.helmet;
        if (typeof H.contentSecurityPolicy === "undefined") {
            H.contentSecurityPolicy = false;
        }
        if (H.contentSecurityPolicy) {
            this.application.use(helmet.contentSecurityPolicy(H.contentSecurityPolicy));
        }
        if (typeof H.dnsPrefetchControl === "undefined") {
            H.dnsPrefetchControl = true;
        }
        if (H.dnsPrefetchControl) {
            this.application.use(helmet.dnsPrefetchControl(H.dnsPrefetchControl));
        }
        if (typeof H.expectCt === "undefined") {
            H.expectCt = false;
        }
        if (H.expectCt) {
            this.application.use(helmet.expectCt(H.expectCt));
        }
        if (typeof H.frameguard === "undefined") {
            H.frameguard = true;
        }
        if (H.frameguard) {
            this.application.use(helmet.frameguard(H.frameguard));
        }
        if (typeof H.hidePoweredBy === "undefined") {
            H.hidePoweredBy = true;
        }
        if (H.hidePoweredBy) {
            this.application.use(helmet.hidePoweredBy(H.hidePoweredBy));
        }
        if (typeof H.hsts === "undefined") {
            H.hsts = {
                maxAge: 365 * 24 * 60 * 60, // one year in seconds
            };
        }
        if (H.hsts) {
            this.application.use(helmet.hsts(H.hsts));
        }
        if (typeof H.ieNoOpen === "undefined") {
            H.ieNoOpen = true;
        }
        if (H.ieNoOpen) {
            this.application.use(helmet.ieNoOpen(H.ieNoOpen));
        }
        if (typeof H.noSniff === "undefined") {
            H.noSniff = true;
        }
        if (H.noSniff) {
            this.application.use(helmet.noSniff(H.noSniff));
        }
        if (typeof H.permittedCrossDomainPolicies === "undefined") {
            H.permittedCrossDomainPolicies = false;
        }
        if (H.permittedCrossDomainPolicies) {
            this.application.use(helmet.permittedCrossDomainPolicies(H.permittedCrossDomainPolicies));
        }
        if (typeof H.referrerPolicy === "undefined") {
            H.referrerPolicy = false;
        }
        if (H.referrerPolicy) {
            this.application.use(helmet.referrerPolicy(H.referrerPolicy));
        }
        if (typeof H.xssFilter === "undefined") {
            H.xssFilter = true;
        }
        if (H.xssFilter === true) {
            this.application.use(helmet.xssFilter());
        }
        else if (H.xssFilter && typeof H.xssFilter === "object") {
            this.application.use(helmet.xssFilter(H.xssFilter));
        }
    }
    /**
     * Setup cors on the server application
     *
     * @return {Promise<void>}
     */
    async setupCors() {
        if (!this.kernel.felony.config.cors || typeof this.kernel.felony.config.cors !== "object") {
            this.kernel.felony.config.cors = {};
        }
        const H = this.kernel.felony.config.cors;
        this.application.use(cors({
            headers: H.headers,
            origin: H.origin || "",
            credentials: !!H.credentials,
            methods: H.methods || "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: H.preflightContinue || false,
            optionsSuccessStatus: H.optionsSuccessStatus || 204,
        }));
    }
}
//# sourceMappingURL=Server.js.map