"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Todo } from "./interfaces";
import { addTask, getTasks, toggleTask, deleteTask } from "./actions";
import { FormEvent } from "react";

interface TodoItemProps {
  item: Todo;
  refreshData: () => void;
  setTasks: Dispatch<SetStateAction<Todo[]>>;
};
const TodoItem = ({ item, refreshData, setTasks } : TodoItemProps) => {
  const id = item._id.toString();
  const toggle = () => {
    setTasks((tasks) => tasks.map((task) => (task._id !== item._id) ? task : { ...task, done: !item.done }));
    toggleTask(id, !item.done).then(() => refreshData());
  };
  const removeTask = () => deleteTask(id).then(() => refreshData());

  return (
    <div className="flex items-center mb-4 mt-1 ml-1">
        <input
          id={id}
          checked={item.done}
          onChange={toggle}
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        />
        <label
          htmlFor={id}
          className={`ms-2 text-sm font-medium cursor-pointer w-full select-none ${item.done ? 'text-gray-600 dark:text-gray-100 line-through' : 'text-gray-900 dark:text-gray-300'}`}
        >
          { item.name }
        </label>
        { item.done && (
          <button className="mx-5" onClick={removeTask}>
            x
          </button>
        )}
    </div>
  );
};

export default ({ email } : { email : string }) => {
  const [ tasks, setTasks ] = useState([] as Todo[]);
  const [ loading, setLoading ] = useState(false);

  const refreshData = () => getTasks(email).then((data) => setTasks(data));

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.error('Service Worker registration failed', err));
    }
    refreshData();
  }, []);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) {
        return;
    }
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const taskName = formData.get("taskName")?.toString();
    if (!taskName) {
      return;
    }
    addTask(email, taskName).then(() => {
      refreshData();
      (e.target as HTMLFormElement).reset();
    }).finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-1 flex-col justify-between bg-slate-300 shadow-lg rounded-md p-2 m-2 gap-3">
      <h1 className="text-black font-bold text-xl">Todo</h1>
      <div className="flex flex-1 gap-1 flex-col text-black overflow-y-scroll">
        {tasks.map((item) => (
          <TodoItem
            key={item._id.toString()}
            item={item}
            refreshData={refreshData}
            setTasks={setTasks}
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
