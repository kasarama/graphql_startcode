import express from "express";
const router = express.Router();

import { ApiError } from "../errors/apiErrors";
import fetcher from "../facades/fetcher";

//get info about a name
router.get("/:name", async (req: any, res, next) => {
  try {
    const name = req.params.name;

    res.json(await fetcher(name));
  } catch (err) {
    next(new ApiError(err.massage));
  }
});

export default router;
