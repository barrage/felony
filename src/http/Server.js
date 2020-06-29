import hpp from "hpp";
import cors from "cors";
import http from "http";
import https from "https";
import helmet from "helmet";
import express from "express";
import Route from "../../base/Route.js";
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
   * All the routes loaded
   *
   * @type Route[]
   */
  routes = [];

  /**
   * Server instance
   *
   * @type RequestListener
   */
  application = express();

  /**
   * Router instance
   *
   * @type any
   */
  router;

  /**
   * Status of the HTTP server
   *
   * @type string
   */
  status = "pending";

  /**
   * Load all defined routes within the framework and set them up for listening.
   *
   * @return {Promise<void>}
   */
  async load() {
    const routes = await Felony.kernel.readRecursive(`${Felony.appRootPath}/routes/`, [".js"]);

    for (const route of routes) {
      const Imported = (await import(route)).default;
      const Instance = new Imported(this);

      Instance.__path = route.replace(`${Felony.appRootPath}/`, "");

      if (Instance instanceof Route) {
        if (["ALL", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"].indexOf(Instance.method.toUpperCase()) === -1) {
          throw new Error(`Server: route '${route}': unknown method supplied: '${Instance.method}'`);
        }

        if (!Instance.path || Instance.path.startsWith("/") !== true) {
          throw new Error(`Server: route '${route}': path defined '${Instance.path}' is not valid, path has to start with '/'`);
        }

        // This is the way to test loading of all the middleware during the application startup
        // we don't actually need them here, but we'll go ahead so we don't startup application
        // with faulty middleware.
        let middleware = await Instance.getMiddleware();
        middleware = null;

        this.routes.push(Instance);
      }

      this.status = "loaded";
    }
  }

  /**
   * Launch the actual server that will listen to the incoming requests.
   *
   * @return {Promise<void>}
   */
  async serve() {
    await this.setupApplication();

    await Felony.event.raise(new FelonyServerLoaded(this));

    this.router = express.Router(Felony.config.server.router || {});

    for (const route of this.routes) {
      const method = route.method.toLowerCase();
      const path = route.path;

      this.router[method](path, ...(await this.compileCallbacks(route)));
    }

    await Felony.event.raise(new FelonyServerReady(this));

    this.application.use(this.router);

    if (typeof Felony.config.server.https === 'object' && Felony.config.server.https) {
      this.server = https.createServer(Felony.config.server.https, this.application);
    }
    else {
      this.server = http.createServer(this.application);
    }

    this.server.listen(Felony.config.server.port, async () => {
      this.status = "listening";

      console.log(`Server listening on port ${Felony.config.server.port}`);
      await Felony.event.raise(new FelonyServerListening(this));
    });
  }

  /**
   * Close the server listeners
   *
   * @param {number} force In seconds
   * @return {Promise<void>}
   */
  close(force = 300) {
    return new Promise((resolve) => {
      if (this.status === "listening") {
        console.warn("Starting to close http(s) server...");

        // Force the shutdown after given number of seconds
        setTimeout(() => {
          if (this.status !== "pending") {
            console.log("Server is taking to long to close connection, moving on...");
            resolve();
          }
        }, force * 1000);

        this.server.close(() => {
          console.log("Server connections closed, server terminated");

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
   * @param {Route} route
   * @return {Promise<array>}
   */
  async compileCallbacks(route) {
    await Felony.event.raise(new FelonyServerBeforeRouteCompile(route));

    // Get all the middleware from the route and map them as
    // async callbacks for express route handler.
    const callbacks = (await route.getMiddleware())
      .map(middleware => async (request, response, next) => {
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
    Felony.config.server = Felony.config.server || {
      port: 5445,
    };

    if (Felony.arguments.SERVER_PORT) {
      Felony.config.server.port = Felony.arguments.SERVER_PORT;
    }

    this.application.use(express.json(Felony.config.server.json || {}));

    if (Felony.config.server.static && typeof Felony.config.server.static === "object") {
      this.application.use(express.static(Felony.config.server.static));
    }

    if (Felony.config.server.raw && typeof Felony.config.server.raw === "object") {
      this.application.use(express.raw(Felony.config.server.raw));
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
    if (!Felony.config.helmet || typeof Felony.config.helmet !== "object") {
      Felony.config.helmet = {};
    }

    const H = Felony.config.helmet;

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
    if (!Felony.config.cors || typeof Felony.config.cors !== "object") {
      Felony.config.cors = {};
    }

    this.application.use(cors({
      headers: Felony.config.cors.headers,
      origin: Felony.config.cors.origin || "",
      credentials: !!Felony.config.cors.credentials,
      methods: Felony.config.cors.methods || "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: Felony.config.cors.preflightContinue || false,
      optionsSuccessStatus: Felony.config.cors.optionsSuccessStatus || 204,
    }));
  }
}
