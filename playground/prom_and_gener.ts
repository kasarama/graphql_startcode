import facade from "../src/facades/friendNoDB";
import { IFriend } from "../src/interfaces/IFriend";

const initialFriend = {
  firstName: "Maagda",
  lastName: "Wawrzak",
  email: "mw@b.dk",
  password: "secret",
};
//sequential:
async function manipulateFriendSequential() {
  try {
    let addedFriend = await facade.addFriend(initialFriend);
    let foundByID;
    !addedFriend || !addedFriend.id
      ? () => {
          throw new Error("not added");
        }
      : (foundByID = await facade.getFriendByID(addedFriend.id));

    let foundByEmail;
    foundByID && foundByID.email
      ? (foundByEmail = await facade.getFrind(foundByID.email))
      : () => {
          throw new Error("not found ");
        };

    let deletedFriend;
    foundByEmail && foundByEmail.email
      ? (deletedFriend = await facade.deleteFriend(foundByEmail.email))
      : () => {
          throw new Error("not deleted");
        };
    console.log(deletedFriend);
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Sequential method done.\n\n");
  }
}

//paraller:
async function getDataParaller() {
  const promises = [];
  for (let i = 0; i < 5; i++) {
    const friend = { ...initialFriend, firstName: `${i}M${i}M` };
    promises.push(facade.addFriend(friend));
  }
  const addedFriends = await Promise.all(promises);
  console.log(addedFriends.reduce(reducer, "Added friends: "));
}

const reducer = (startValue: string, currentValue: IFriend | null) =>
  currentValue ? `${startValue}, ${currentValue.firstName}` : "none";

manipulateFriendSequential();

getDataParaller();

/*generic specifies what type the function returns. 
it means that if we provie a string as an argument, 
the returned argument must be of the same type*/
function gen<Type extends {name:string, age:number}>(arg: Type): Type {
let id= Math.floor(Math.random() *100)
  return {...arg, id};
}

console.log("GENERIC correct: ",gen({name:"Magda", age: 33}))
//console.log("GENERIC fail: ",gen({ age: 33}))
