import { Request, Response } from "express";

const corsHandler = (req: Request, res: Response, next: () => void) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept"
  );
  next();
};

export default corsHandler;
