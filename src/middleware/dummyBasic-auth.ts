import auth from "basic-auth";
import compare from "tsscmp";

import { Request, Response } from "express";
import facade from "../facades/DummyDB-Facade";

const authMiddleware = async function (
  req: Request,
  res: Response,
  next: Function
) {
  var credentials = auth(req);
  // Check credentials
  // The "check" function will typically be against your user store
  if (credentials && (await check(credentials.name, credentials.pass, req))) {
    next();
  } else {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  }
};

export default authMiddleware;

//              ----------------------------               //

// Basic function to validate credentials for example
async function check(name: string, pass: string, req: any) {
  const user = await facade.getFriendByID(name);
  if (user && compare(pass, user.password)) {
    req.credentials = { username: user.id, role: "user" }; //req has type any because typescript does not allow to set ne prop on it
    return true;
  }
  return false;
}
