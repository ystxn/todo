"use client"

import { useEffect, useState } from "react";
import { Todo } from "./interfaces";
import { addTask, getTasks, toggleTask } from "./actions";
import { FormEvent } from "react";

const TodoItem = ({ item, refreshData } : { item: Todo, refreshData: () => void }) => {
  const toggle = () => {
    toggleTask(item._id, !item.done).then(() => refreshData());
  };
  return (
    <div className="flex items-center mb-4 ml-1">
        <input
          id={item._id.toString()}
          checked={item.done}
          onChange={toggle}
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        />
        <label
          htmlFor={item._id.toString()}
          className={`ms-2 text-sm font-medium cursor-pointer select-none ${item.done ? 'text-gray-600 dark:text-gray-100 line-through' : 'text-gray-900 dark:text-gray-300'}`}
        >
          { item.name }
        </label>
    </div>
  );
};

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
    if (!taskName) {
      return;
    }
    addTask(taskName).then(() => {
      refreshData();
      (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <div className="flex flex-1 flex-col justify-between bg-slate-300 shadow-lg rounded-md p-5 m-5 gap-3">
      <h1 className="text-black font-bold">Todo</h1>
      <div className="flex flex-1 gap-1 flex-col text-black overflow-y-scroll">
        {tasks.map((item) => (
          <TodoItem
            key={item._id.toString()}
            item={item}
            refreshData={refreshData}
          />
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-5">
        <input
          className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="taskName"
          type="text"
          placeholder="New task.."
          autoComplete="off"
        />
        <button
          className="shadow bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-nowrap"
          type="submit"
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
