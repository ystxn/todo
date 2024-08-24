"use client"

import { useEffect, useState } from "react";
import { Todo } from "./interfaces";
import { addTask, getTasks } from "./actions";
import { FormEvent } from "react";

export default () => {
  const [ tasks, setTasks ] = useState([] as Todo[]);

  const refreshData = () => getTasks().then((data) => setTasks(data));

  useEffect(() => {
    refreshData();
  }, []);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const taskName = formData.get("taskName")?.toString();
    if (taskName) {
      addTask(taskName).then(() => refreshData());
    }
  };

  return (
    <div className="w-full max-w-xs">
      <form
        className="bg-white shadow-md rounded p-8 m-8"
        onSubmit={handleFormSubmit}
      >
        <h1 className="text-black font-bold mb-3">Todo</h1>
        <ul>
          {tasks.map((item) => (
            <li key={item._id.toString()} className="text-black">
              <h2>{item.name}</h2>
            </li>
          ))}
        </ul>

        <input
          className="mb-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="taskName"
          type="text"
          placeholder="New task.."
        />
        <button
          className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
