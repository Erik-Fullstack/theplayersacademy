import { IUser } from "./user";

export interface ISeat {
  id: string;
  userId: string;
  user: IUser;
}
