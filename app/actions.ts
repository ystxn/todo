"use server";

import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Todo } from "../app/interfaces";
import { decodeJWT } from "./util";

const collection = client.db("todo").collection<Todo>("todo");

const authorise = (token : string) => {
  return decodeJWT(token).email;
};

export const getTasks = async (token : string) : Promise<Todo[]> => {
  const email = authorise(token);
  try {
    const data = await collection
      .find({ owner: email })
      .sort({ done: 1, created: 1 })
      .limit(20)
      .toArray();
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addTask = async (token : string, newTaskName : string) => {
  const email = authorise(token);
    const newTodo : Todo = {
        _id: new ObjectId(),
        name: newTaskName,
        done: false,
        created: new Date(),
        owner: email,
    };
    console.log('Creating new todo:', newTodo);
    await collection.insertOne(newTodo);
    return await getTasks(email);
};

export const toggleTask = async (token: string, id: string, done: boolean) => {
  console.log(`Marking todo ${id} as ${done}`);
  const email = authorise(token);
  const data = await collection.updateOne({ _id: new ObjectId(id), owner: email }, { $set: { done } });
  return JSON.parse(JSON.stringify(data));
};

export const deleteTask = async (token : string, id: string) => {
  const email = authorise(token);
  await collection.deleteOne({ _id: new ObjectId(id), owner: email });
};
