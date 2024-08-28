import { ObjectId } from "mongodb";

export interface Todo {
  _id: ObjectId;
  name: string;
  done: boolean;
  created: Date;
  owner: string;
  order: number;
}
export interface TodoOrder {
  id: string;
  order: number;
}
