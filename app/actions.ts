"use server";

import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Todo } from "../app/interfaces";

const collection = client.db("todo").collection<Todo>("todo");

export const getTasks = async (email : string) : Promise<Todo[]> => {
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

export const addTask = async (email : string, newTaskName : string) => {
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

export const toggleTask = async (id: string, done: boolean) => {
  console.log(`Marking todo ${id} as ${done}`);
  const data = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { done } });
  return JSON.parse(JSON.stringify(data));
};

export const deleteTask = async (id: string) => {
  await collection.deleteOne({ _id: new ObjectId(id) });
};
