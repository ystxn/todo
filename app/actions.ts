"use server";

import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Todo } from "../app/interfaces";

export const getTasks = async () : Promise<Todo[]> => {
  try {
    const data = await client.db("todo")
      .collection<Todo>("todo")
      .find({})
      .sort({ done: 1, created: -1 })
      .limit(20)
      .toArray();
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addTask = async (newTaskName : string) => {
    const newTodo : Todo = {
        _id: new ObjectId(),
        name: newTaskName,
        done: false,
        created: new Date()
    };
    console.log('Creating new todo:', newTodo);
    const data = await client.db("todo").collection("todo").insertOne(newTodo);
    return JSON.parse(JSON.stringify(data));
};

export const toggleTask = async (id: ObjectId, done: boolean) => {
  console.log(`Marking todo ${id} as ${done}`);
  const data = await client.db("todo").collection("todo").updateOne({ _id: new ObjectId(id) }, { $set: { done } });
  return JSON.parse(JSON.stringify(data));
};
