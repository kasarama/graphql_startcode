import { IFriend } from "../interfaces/IFriend";

function singleValuePromise<T>(val: T | null): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    setTimeout(() => resolve(val), 0);
  });
}
function arrayValuePromise<T>(val: Array<T>): Promise<Array<T>> {
  return new Promise<Array<T>>((resolve, reject) => {
    setTimeout(() => resolve(val), 0);
  });
}

class FriendsFacade {
  friends: Array<IFriend> = [
    {
      id: "id1",
      firstName: "Peter",
      lastName: "Pan",
      email: "pp@b.dk",
      password: "secret",
    },
    {
      id: "id2",
      firstName: "Donald",
      lastName: "Duck",
      email: "dd@b.dk",
      password: "secret",
    },
  ];
  async addFriend(friend: IFriend): Promise<IFriend | null> {
    // throw new Error("Not Yet Implemented");

    const id = `id${this.friends.length}`;
    // parseInt(this.friends[this.friends.length - 1].id.slice(2), 10) + 1;
    friend.id = "id" + id;
    this.friends.push(friend);
    return singleValuePromise<IFriend>(this.friends[this.friends.length - 1]);
  }
  async deleteFriend(friendEmail: string): Promise<IFriend | null> {
    //throw new Error("Not Yet Implemented But return element deleted or null");
    let friend = this.friends.find((f) => f.email === friendEmail);

    if (!friend)
      // this.friends.splice(this.friends.indexOf(friend),1):()=>{friend=null}

      return singleValuePromise<IFriend>(null);
    else {
      this.friends.splice(this.friends.indexOf(friend), 1);
      return singleValuePromise<IFriend>(friend);
    }
  }
  async getAllFriends(): Promise<Array<IFriend>> {
    const f: Array<IFriend> = this.friends;
    return arrayValuePromise<IFriend>(f);
  }
  async getFrind(friendEmail: string): Promise<IFriend | null> {
    let friend: IFriend | null;
    friend = this.friends.find((f) => f.email === friendEmail) || null;
    return singleValuePromise<IFriend>(friend);
  }

  async getFriendByID(id: string): Promise<IFriend | null> {
    let friend: IFriend | null;
    friend = this.friends.find((f) => f.id === id) || null;
    return singleValuePromise<IFriend>(friend);
  }
}

const facade = new FriendsFacade();
export default facade;
