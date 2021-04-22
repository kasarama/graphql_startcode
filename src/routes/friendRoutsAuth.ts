import express from "express";
const router = express.Router();

import { ApiError } from "../errors/apiErrors";
import FriendFacade from "../facades/friendFacade";
const debug = require("debug")("friend-routes");

let facade: FriendFacade;
// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
  if (!facade) {
    const db = req.app.get("db");
    debug("Database used: " + req.app.get("db-type"));
    facade = new FriendFacade(db);
  }

  next();
});

// This does NOT require authentication in order to let new users create themself
router.post("/", async (req, res, next) => {
  try {
    let newFriend = req.body;
    const status = await facade.addFriend(newFriend);
    res.json({ status });
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      next(err);
    } else {
      const id = await facade.addFriend;
      res.json(id);
      next();
    }
  }
});

// ALL ENDPOINTS BELOW REQUIRES AUTHENTICATION

import authMiddleware from "../middleware/basic-auth";
const USE_AUTHENTICATION = !process.env["SKIP_AUTHENTICATION"];
//router.use("/", authMiddleware);

if (USE_AUTHENTICATION) {
  router.use(authMiddleware);
}

router.get(
  "/demo",
  async (req: any, res) => {
    res.json({ demo: "HEEEEEEEEEEEJ" });
  },
  authMiddleware
);

router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriends();

  const friendsDTO = friends.map((friend) => {
    const { firstName, lastName, email } = friend;
    return { firstName, lastName, email };
  });
  res.json(friendsDTO);
});

/**
 * authenticated users can edit himself
 */
router.put("/editme", async function (req: any, res, next) {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500);
    }
    const email = req.credentials.userName; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    const friend = req.body;
    res.json(await facade.editFriend(email, friend));
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(err.message, 400));
  }
});

router.get("/me", async (req: any, res, next) => {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500);
    }
    const email = req.credentials.userName; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    const user = await facade.getFriend(email);
    if (user == null) {
      throw new ApiError("user not found", 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

//These endpoint requires admin rights

//An admin user can fetch everyone
router.get("/find-user/:email", async (req: any, res, next) => {
  try {
    if (
      (USE_AUTHENTICATION && !req.credentials.role) ||
      req.credentials.role !== "admin"
    ) {
      throw new ApiError("Not Authorized", 401);
    }
    const userId = req.params.email;
    const friend = await facade.getFriend(userId);
    if (friend == null) {
      next(new ApiError("user not found", 404));
    }

    res.json(friend);
  } catch (err) {
    next(err);
  }
});

//An admin user can edit everyone
router.put("/:email", async function (req: any, res, next) {
  try {
    if (
      (USE_AUTHENTICATION && !req.credentials.role) ||
      req.credentials.role !== "admin"
    ) {
      throw new ApiError("Not Authorized", 401);
    }
    const email = req.params.email; //null; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    let newFriend = req.body;

    res.json(await facade.editFriend(email, newFriend));
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(err.message, 400));
  }
});

//An admin user can delete everyone
router.delete("/:email", async function (req: any, res, next) {
  try {
    if (
      (USE_AUTHENTICATION && !req.credentials.role) ||
      req.credentials.role !== "admin"
    ) {
      throw new ApiError("Not Authorized", 401);
    }
    const email = req.params.email; //null; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)

    res.json({deleted:await facade.deleteFriend(email)});
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(err.message, 400));
  }
});
export default router;
