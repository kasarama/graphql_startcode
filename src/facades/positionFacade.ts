import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from "../interfaces/IPosition";
import FriendsFacade from "./friendFacade";
import { DbConnector } from "../config/dbConnector";
import { ApiError } from "../errors/apiErrors";
import { IPoint } from "../interfaces/geoInterfaces";

class PositionFacade {
  db: Db;
  positionCollection: Collection;
  friendFacade: FriendsFacade;

  constructor(db: Db) {
    this.db = db;
    this.positionCollection = db.collection("positions");
    this.friendFacade = new FriendsFacade(db);
  }
  /*
 IPosition {
  lastUpdated: Date;
  email: string;
  name: string;
  location: IPoint;
}
*/
  async addOrUpdatePosition(
    email: string,
    longitude: number,
    latitude: number
  ): Promise<IPosition> {
    try {
      const friend = await this.friendFacade.getFriendFromEmail(email);
      const point: IPoint = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
      const position: IPosition = {
        lastUpdated: new Date(),
        email: email,
        name: friend.firstName + " " + friend.lastName,
        location: point,
      };
      const query = { email };
      const update = { $set: { ...position } }; //hle IPosition skal gives her
      const options = { upsert: true, returnOriginal: false };
      const result = await this.positionCollection.findOneAndUpdate(
        query,
        update,
        options
      );
      return result.value;
    } catch (err) {
      throw err;
    }
  }

  async findNearbyFriends(
    email: string,
    password: string,
    longitude: number,
    latitude: number,
    distance: number
  ): Promise<Array<IPosition>> {
    //check if the friend exists
    try {
      //update the position
      const friend = await this.friendFacade.getFriendFromEmail(email);
      //const friend = await this.friendFa/cade.getVerifiedUser(email, password)
      await this.addOrUpdatePosition(email, longitude, latitude);
      //const geometry: IPosition = {type:"Point",  }

      return  this.positionCollection
        .find({
          email: { $ne: email },
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: distance,
              //$minDistance: 5,
            },
          },
        })
        .toArray();
    } catch (err) {
      throw err;
    }

  }

  async getAllPositions(): Promise<Array<IPosition>> {
    return this.positionCollection.find({}).toArray();
  }
}

export default PositionFacade;

async function tester() {
  const client = await DbConnector.connect();
  const db = client.db(process.env.DB_NAME);
  const positionFacade = new PositionFacade(db);
  await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5);
  process.exit(0);
}

//tester()
