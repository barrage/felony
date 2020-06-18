# Felony

Framework for lazy developers with security in mind that promotes good project structure and code segregation.

HTTP Server is wrapper around [ExpressJS](https://expressjs.com/) framework with preloaded security defaults.

## Requirements

Felony has been written with node v14 in mind, it might not work with older versions of node.
It assumes your are writing your application as ESM module, you will have to specify that in your `package.json`:

```json
{ 
  "type": "module"
}
```

## Installation

Install Felony as a dependency of your project:

```shell script
npm install --save felony
```

Create `index.js` file:
```js
import { app as Felony } from "felony";
Felony.commit();
```

And that's it, you will now have access to Felony right away, give it a try:

```shell script
node index.js
```

Without any passed arguments, you will just get `console.dir(Felony)` back that will display all the loaded modules.

To start HTTP server simply pass the `http` argument to `index.js`:

```shell script
node index.js http
```

## ExpressJS

As already mentioned, Felony lifts Express as HTTP(s) server with security plugins already enabled and added by default.

We have included:

- *HPP* (HTTP Parameter Pollution) protection (default: enabled)
- *Helmet* package that includes:
  - *contentSecurityPolicy* for setting Content Security Policy	(default: disabled)
  - *crossdomain* for handling Adobe products' crossdomain requests	(default: disabled)
  - *dnsPrefetchControl* controls browser DNS prefetching (default: enabled)
  - *expectCt* for handling Certificate Transparency (default: disabled)
  - *frameguard* to prevent clickjacking (default: enabled)
  - *hidePoweredBy* to remove the X-Powered-By header (default: enabled)
  - *hsts* for HTTP Strict Transport Security (default: enabled)
  - *ieNoOpen* sets X-Download-Options for IE8+ (default: enabled)
  - *noSniff* to keep clients from sniffing the MIME type (default: enabled)
  - *referrerPolicy* to hide the Referer header (default: disabled)
  - *xssFilter* adds some small XSS protections (default: enabled)
- *Cors* (default: enabled, but lax)

If you don't configure any of them, they will use default configurations, we strongly encourage you to research those options,
and configure them for your project and needs. It will not make your application bulletproof, but will help you fend off
most of the script-kiddie hackers.

- https://www.npmjs.com/package/hpp
- https://www.npmjs.com/package/helmet
- https://www.npmjs.com/package/cors

## Configuration

Felony will automatically load configuration files that are placed in `config/` directory of your project:

To configure HTTP server, you will create `config/server.js` file:

```js
export default {
  port: 5445,

  // https://expressjs.com/en/4x/api.html#express.router
  router: {
    caseSensitive: false,
    mergeParams: false,
    strict: false,
  },

  // https://helmetjs.github.io/
  helmet: {},
}
```

To modify default cors configurations for your server, add `config/cors.js` file:

```js
export default {
  origin: "*",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  headers: [
    "user-agent",
    "content-type",
    "accept-language",
    "x-forwarded-for",
  ],
}
```

All the configurations will be then available on `Felony.config` in your application.

### Environment specific configurations

Felony will recognize if your export `NODE_ENV` before you run it and it will be stored in `Felony.environment` property.
This property will be used to load configuration files from `config/environments/{YOUR_ENV}/any-config.js`.

This means, if, for example you want to override cors configurations for your production application, 
you would create `config/environments/production/cors.js`, that would automatically override 
`config/cors.js`

then run your application with NODE_ENV set:

```shell script
NODE_ENV=production node index.js
```

## Running, helpers and application

Felony comes with integrated commands that will help you in building your project, to show what commands are available run:

```shell script
node index.js commands
```

The commands offered as integrated will help you generate your own commands, databases, routes, middleware, events and listeners.

## Routes

To create route, simply run:
```shell script
node index.js command=make:route name=GetVersion.js method=GET path=/version
```

This will create empty route file under `routes/GetVersion.js`, modify it:

```js
import Route from "felony/base/Route.js";
import { promises as fs } from "fs";
export default class GetVersion extends Route {
  method = "GET";
  path = "/version";
  description = "";
  middleware = [];
  async handle(request, response) {
    const file = await fs.readFile("./package.json", "utf-8");
    const pkg = JSON.parse(file.toString());
    response.status(200).send({ version: pkg.version });
  }
}

```

Start the application with:

```shell script
node index.js http
```

...and open in your browser: http://localhost:5445/version

Thats it!

## Middleware

As you have noticed, route has property `middleware = []` in that array you can put paths to any middleware you create:

```shell script
node index.js command=make:middleware name=LogRequest.js
```

Your middleware will be created under `middleware/LogRequest.js`:

```js
import Middleware from "felony/base/Middleware.js";
export default class LogRequest extends Middleware {
  async handle(request, response, next) {
    next();
  }
}

```

*IMPORTANT*: You absolutely have to call `next()` or return response in every middleware, otherwise your server will hang once the route is called!

To add this middleware to your route, edit the route and add the path to it in `middleware` array:

```js
import Route from "felony/base/Route.js";
import { promises as fs } from "fs";
export default class GetVersion extends Route {
  method = "GET";
  path = "/version";
  description = "";
  middleware = ["../middleware/LogRequest.js"]; // Note that the path is relative from routes directory
  async handle(request, response) {
    const file = await fs.readFile("./package.json", "utf-8"); // unlike fs that works from the application root where node was started
    const pkg = JSON.parse(file.toString());
    response.status(200).send({ version: pkg.version });
  }
}

```

## Commands

Commands are useful tools that can enable you to run certain tasks for your application, and are designed to run from CLI, but can also be called from
within your application.

To get started, simply use the included helper command to create one:

```shell script
node index.js command=make:command name=ExampleCommand.js signature=example
```

Command will be created under `commands/ExampleCommand.js`.

Within the command you'll get `async handle() {}` method where you should put the command logic, and then you'll be able to simply run it:

```shell script
node index.js command=example
```

In the command, all the arguments passed will be available in the payload object: `this.payload`.

## Database

You can create configuration file that will hold the connection settings, for example: `config/database.js`:

```js
export default {
  redis: {
    host: "localhost",
    port: 6379,
  }
}
```

...and this will be available under `Felony.config.database`

Felony, does not come with any database preferences, instead, we provide you with easy database setup:

```shell script
node index.js command=make:database name=Redis.js
```

This will create `databases/Redis.js` where you will have two methods to use `async handle() {}` and `async close() {}`

Use the `handle` method to connect and setup the connection to any database or database ORM you wish and simply place it on the `client` property.

This will then automatically load on the `Felony` object, and you will be able to access it: `Felony.db.Redis.client`.

```js
import Database from "felony/base/Database.js";
import Redisng from "redisng";

export default class Redis extends Database {
  client = null;
  async handle() {
    this.client = new Redisng();
    await this.client.connect(Felony.config.database.redis.host, Felony.config.database.redis.port);
  }
  async close() {
    await this.client.close();
  }
}
```

## Events

Felony has its own kind of events called `FelonyEvent` that can be raised on any occasion within your application,
this allows you to later extend the features and actions of your application without having to dig through the code.

To create an event, you can simply run:

```shell script
node index.js command=make:event name=Hello.js
```

This will create simple class:

```js
import FelonyEvent from "felony/base/FelonyEvent.js";
export default class Hello extends FelonyEvent {}
```

You can modify it to accept whatever payload you want when you construct the event:

```js
import FelonyEvent from "felony/base/FelonyEvent.js";
export default class Hello extends FelonyEvent {
  payload = null;
  constructor(payload) {
    super();
    this.payload = payload;
  }
}
```

...and then, anywhere in your application you can raise this event:

```js
await Felony.event.raise(new Hello({ value: true }));
```

*IMPORTANT*: In order to not get unexpected behaviour, events must have unique name.

## Listeners

Listeners are listening (go figure) for raised events, create a listener by running:

```shell script
node index.js command=make:listener name=HelloListener.js
```

```js
import Listener from "felony/base/Listener.js";
export default class HelloListener extends Listener {
  static listen = [];
  async handle() {}
}

```

This listener like this won't do much since its not listening to anything, to get it to listen for an event, add name of the event class
you want it to listen, and then once the event is raised, Felony will call this listener and pass it the raised event:

```js
import Listener from "felony/base/Listener.js";
export default class HelloListener extends Listener {
  static listen = [
      "Hello"
  ];
  async handle() {
    console.log("We got event: ", this.event); // We got event: Hello {}
  }
}
```

## Jobs and queue

TODO
