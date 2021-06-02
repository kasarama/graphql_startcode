import express from "express";
import { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import dummyFrienRouts from "./routes/dummyFrinedsRouts";
dotenv.config();
import debug from "debug";
const myDebug = debug("app");
const app = express();
import mylogger from "./middleware/simpleLogger";
import logger, { stream } from "./middleware/logger";
import { ApiError } from "./errors/apiErrors";
import friendRouts from "./routes/friendRoutsAuth";
import nameRouts from "./routes/nameRouts";

var corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev";
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger); //This line sets the logger with a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production
logger.log("info", "Server started"); //Example of how to use the logger
/*
my first middleware:
app.use((req, res, next) => {
 
  //logging to console makes a mess, better is debugging
  console.log("logging to console",
    `${new Date().toLocaleTimeString()}\n${req.method}\n${req.url}\nip: ${
      req.ip
    }\nremoteAddres${req.connection.remoteAddress}`
  );

  
  debug(
    `${new Date().toLocaleTimeString()}\n${req.method}\n${req.url}\nip: ${
      req.ip
    }\nremoteAddres${req.connection.remoteAddress}`
  );

  next();
});
*/
app.use(mylogger);
//app.use('/static', express.static('public'))
app.use(express.static(path.join(process.cwd(), "public"))); //cwd = current working directory
app.use(express.json());

/*
purpouse of this code is to test if log in works and saves credentials. Shoud not be used for anything else
app.get("/me", (req: any, res) => {
  //must use any here, because we did that also in basic-auth.ts to add new property
  const user = req.credentials;
  console.log("user in /me: ", user);
  res.json(user);
});
*/
app.get("/demo", (req, res) => {
  logger.log("info", "demo requested");
  logger.log("error", "some error");
  let a = 123;
  myDebug("It's myDebug talking");
  // a='dss' gives fail that typescripts wants it to be of the first instantiated
  res.send("Server is up!!.!");
});

import myCors from "./middleware/myCors";
//defines cors for following REST endpoints
//app.use(myCors) // customcors

//node cors
import cors from "cors";
app.use(cors());
app.use("/api/dummyFriends", cors(corsOptions), dummyFrienRouts);
//app.use("/api/friends", cors(corsOptions), friendRouts);
app.use("/api/friends", cors(), friendRouts);
app.use("/api/name", cors(corsOptions), nameRouts);

import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema";
import authMiddleware from "./middleware/basic-auth";
app.get("/auth", authMiddleware, (req, res) => {
  res.send("authenticated");
});
//requires auth on each request to this endpoint
//app.use("/graphql", authMiddleware);

//setting authentication to chosen requests
app.use("/graphql", (req, res, next) => {
  const body = req.body;
  //if create friend it sends req further - no ath.required
  //problematic if name of query changes
  if (body && body.query && body.query.includes("createFriend")) {
    console.log("Create");
    return next();
  }

  //used to get acces to grafql without authentication
  if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
    return next();
  }

  //
  if (body.query && (body.mutation || body.query)) {
    return authMiddleware(req, res, next);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

/*
//if there is no endpoint that can send response, it get tu this middleware
app.use((req, res, next) => {
  //res.status(404).json({ msg: "not found", errorCode:404 });
  next();
});*/
//smarter way to do whta in code above
app.use(
  "/api",
  (req, res, next) => {
    res.status(404).json({ msg: "not found", errorCode: 404 });
  },
  cors(corsOptions)
);

app.use(
  myCors,
  // cors(corsOptions),
  (err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof ApiError) {
      //const e:ApiError= err
      res
        .status(err.errorCode)
        .json({ errorCode: err.errorCode, msg: err.message });
    } else {
      next(err);
    }
  }
);



export default app;
