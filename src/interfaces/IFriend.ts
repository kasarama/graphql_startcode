interface IFriend {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}
interface IFriendDTO {
  id?: string;
  name: string;
  email: string;
}
export { IFriend, IFriendDTO };
