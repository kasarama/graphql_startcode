import express from "express";

import dotenv from "dotenv";

dotenv.config();
const debug = require("DEBUG")("app");
const logger=  (req: { method: any; url: any; },res: any,next: () => void)=>{
    debug(`${new Date().toLocaleTimeString()}\n${req.method}\n${req.url}\n`);
    
      next();
}


export default logger