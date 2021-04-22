import express from "express";
const router = express.Router();

import facade from "../facades/DummyDB-Facade";
import { IFriend } from "../interfaces/IFriend";

import authMiddleware from "../middleware/basic-auth";
router .use("/",authMiddleware);
router.get("/all", async (req, res) => {
  const friends = await facade.getAllFriends();
  res.json(
    friends.map((f) => {
      /*   const friend={
    name:f.firstName+' '+f.lastName,
   email: f.email}*/

      const { firstName, lastName } = f;
      return { firstName: firstName, lastName: lastName };
    })
  );
});

router.post("/addnew", async (req, res) => {
  const friend = req.body;
  const newFriend = await facade.addFriend(friend);

  res.json(newFriend);
});

router.delete("/:email", async (req, res) => {
  const deletedFriend = await facade.deleteFriend(req.params.email);
  res.json(deletedFriend);
});

router.get("/findby-username/:userid", async (req, res, next) => {
  const userID = req.params.userid;
  const fr = await facade.getFriendByID(userID);
  if (fr == null) {
    // throw new Error("user not found");
    return next(new Error("user not found"));
  }
  const { firstName, lastName, email } = fr;
  const friendDTO = { firstName, lastName, email };
  res.json(friendDTO);
});
export default router;
