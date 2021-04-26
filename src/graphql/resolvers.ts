import FriendFacade from "../facades/friendFacade";
import { IFriend } from "../interfaces/IFriend";
import { ApiError } from "../errors/apiErrors";
import { Request } from "express";
import fetch from "node-fetch";
import e from "cors";

let friendFacade: FriendFacade;

/*
We don't have access to app or the Router so we need to set up the facade in another way
In www.ts IMPORT and CALL the method below, like so: 
      setupFacade(db);
Just before the line where you start the server
*/
export function setupFacade(db: any) {
  if (!friendFacade) {
    friendFacade = new FriendFacade(db);
  }
}

// resolver map
export const resolvers = {
  Query: {
    getAllFriends: (root: any, _: any, req: any) => {
      if (
        !req.credentials ||
        !req.credentials.role ||
        req.credentials.role !== "admin"
      ) {
        throw new ApiError("Not Authorized", 401);
      }

      return friendFacade.getAllFriendsV2();
    },

    getAllFriendsProxy: async (root: object, _: any, context: Request) => {
      let options: any = { method: "GET" };

      //This part only required if authentication is required
      const auth = context.get("authorization");
      if (auth) {
        options.headers = { authorization: auth };
      }
      return fetch(
        `http://localhost:${process.env.PORT}/api/friends/all`,
        options
      ).then((r) => {
        if (r.status >= 400) {
          throw new Error(r.statusText);
        }
        return r.json();
      });
    },

    getFriend: (root: any, { email }: { email: string }, req: any) => {
      if (!req.credentials || !req.credentials.role) {
        throw new ApiError("Not Authorized", 401);
      }
      if (req.credentials.role == "admin")
        return friendFacade.getFriendFromEmail(email);
      if (req.credentials.role == "user") {
        email = req.credentials.userName;
        return friendFacade.getFriendFromEmail(email);
      }
    },
  },
  Mutation: {
    createFriend: async (_: object, { input }: { input: IFriend }) => {
      return friendFacade.addFriendV2(input);
    },
    //user with any role can edit himself. Even thoug email is required in input,
    //it is not being used for update. the one that I use is from credentials

    editMe: async (_: object, { input }: { input: IFriend }, context: any) => {
      if (context.credentials && context.credentials.userName) {
        const email = context.credentials.userName;
        return friendFacade.editFriendV2(email, input);
      } else throw new ApiError("Not Authorized", 401);
    },

    editFriend: async (
      _: object,
      { input }: { input: IFriend },
      context: any
    ) => {
      if (
        context.credentials &&
        context.credentials.userName &&
        context.credentials.role == "admin"
      ) {
        const email = context.credentials.userName;
        console.log("INPUT  ", input);

        return friendFacade.editFriendV2(input.email, input);
      } else throw new ApiError("Not Authorized", 401);
    },

    deleteFriend: async (
      _: object,
      { input }: { input: string },
      context: any
    ) => {
      if (
        context.credentials &&
        context.credentials.role &&
        context.credentials.role == "admin"
      ) {
        console.log("INPUT  ", input);
        return friendFacade.deleteFriend(input);
      } else throw new ApiError("Not Authorized", 401);
    },
  },
};
