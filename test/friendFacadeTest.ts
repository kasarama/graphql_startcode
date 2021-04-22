import * as mongo from "mongodb";
import FriendFacade from "../src/facades/friendFacade";

import chai from "chai";
const expect = chai.expect;

// use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs from "bcryptjs";
import { InMemoryDbConnector } from "../src/config/dbConnector";
import { ApiError } from "../src/errors/apiErrors";
import e from "express";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", function () {
  before(async function () {
    //  Connect to inmemory test database
    try {
      const client = await InMemoryDbConnector.connect();
      // Get the database and initialize the facade
      const db = client.db();
      // Initialize friendCollection, to operate on the database without the facade
      friendCollection = db.collection("friends");
      facade = new FriendFacade(db);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(async function () {
    const hashedPW = await bcryptjs.hash("secret", 4);
    await friendCollection.deleteMany({});
    //Create a few testusers for ALL the tests
    await friendCollection.insertMany([
      {
        firstName: "Magda",
        lastName: "Wawrzak",
        email: "magda@mail.com",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Hanna",
        lastName: "Manna",
        email: "hanna@mail.com",
        password: hashedPW,
        role: "user",
      },
    ]);
  });

  describe("Verify the addFriend method", () => {
    it("It should Add the user Jan", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
      };
      const status = await facade.addFriend(newFriend);
      expect(status).to.be.not.null;
      const jan = await friendCollection.findOne({ email: "jan@b.dk" });
      expect(jan.firstName).to.be.equal("Jan");
    });

    it("It should not add a user with a role (validation fails)", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
        role: "admin",
      };
      // await expect(facade.addFriend(newFriend)).to.be.rejectedWith(ApiError);
      try {
        await facade.addFriend(newFriend);
        expect(false).to.be.true("SHould never get here");
      } catch (err) {
        expect(err instanceof ApiError).to.be.true;
      }
    });
  });

  describe("Verify the editFriend method", () => {
    it("It should change lastName to XXXX", async () => {
      const newValues = {
        firstName: "Magda",
        lastName: "Wawrzak",
        email: "magda@mail.com",
        password: "secret",
      };
      const count = await facade.editFriend(newValues.email, newValues);
      expect(count.modifiedCount).to.be.equal(1);
    });
  });

  describe("Verify the deleteFriend method", () => {
    it("It should remove the user Peter", async () => {
      expect(await facade.deleteFriend("magda@mail.com")).to.be.true;
    });
    it("It should return false, for a user that does not exist", async () => {
      expect(await facade.deleteFriend("mmm@www.com")).to.be.false;
    });
  });

  describe("Verify the getAllFriends method", () => {
    it("It should get two friends", async () => {
      expect((await facade.getAllFriends()).length).to.be.equal(2);
    });
  });

  describe("Verify the getFriend method", () => {
    it("It should find Hanna Manna", async () => {
      const friend = await facade.getFriendFromEmail("hanna@mail.com");
      expect(friend.firstName).to.equal("Hanna");
    });
    it("It should not find xxx.@.b.dk", async () => {
      await expect(facade.getFriend("xxx.@b.d")).to.be.rejectedWith(ApiError);
    });
  });

  describe("Verify the getVerifiedUser method", () => {
    it("It should correctly validate Hannas's credential,s", async () => {
      const veriefiedHanna = await facade.getVerifiedUser(
        "hanna@mail.com",
        "secret"
      );
      expect(veriefiedHanna).to.be.not.null;
    });

    it("It should NOT validate Hannas's credential,s", async () => {
      const veriefiedHanna = await facade.getVerifiedUser(
        "hanna@mail.com",
        "wrong psw"
      );
      expect(veriefiedHanna).to.be.null;
    });

    it("It should NOT validate a non-existing users credentials", async () => {
      const veriefiedHanna = await facade.getVerifiedUser(
        "NONE@mail.com",
        "secret"
      );
      expect(veriefiedHanna).to.be.null;
    });
  });
});
