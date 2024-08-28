"use client"

import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { Todo } from "./interfaces";
import { addTask, getTasks, toggleTask, deleteTask } from "./actions";
import { FormEvent } from "react";

interface TodoItemProps {
  item: Todo;
  setTasks: Dispatch<SetStateAction<Todo[]>>;
  token: string;
};
const TodoItem = ({ item, setTasks, token } : TodoItemProps) => {
  const id = item._id.toString();
  const toggle = async () => {
    setTasks((tasks) => tasks
      .map((task) => (task._id !== item._id) ? task : { ...task, done: !item.done })
      .toSorted((a, b) => {
        if (a.done !== b.done) {
          return a.done ? 1 : -1;
        }
        return new Date(a.created).getTime() - new Date(b.created).getTime();
      })
    );
    await toggleTask(token, id, !item.done);
  };
  const removeTask = async () => {
    setTasks((tasks) => tasks.filter(({ _id }) => _id.toString() !== id));
    await deleteTask(token, id);
  };

  return (
    <div className="flex items-center mb-4 mt-1 ml-1">
        <input
          id={id}
          checked={item.done}
          onChange={toggle}
          type="checkbox"
          className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        />
        <label
          htmlFor={id}
          className={`ms-2 text-sm font-medium cursor-pointer w-full select-none ${item.done && 'text-gray-400 line-through'}`}
        >
          { item.name }
        </label>
        { item.done && (
          <button className="text-red-700 hover:text-red-500 mx-4" onClick={removeTask}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </button>
        )}
    </div>
  );
};

export default ({ token } : { token : string }) => {
  const [ tasks, setTasks ] = useState([] as Todo[]);
  const [ loading, setLoading ] = useState(false);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) {
      return;
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.error('Service Worker registration failed', err));
    }
    getTasks(token).then((data) => setTasks(data));

    return () => {
      effectRan.current = true;
    };
  }, []);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) {
        return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const taskName = formData.get("taskName")?.toString();
    if (!taskName) {
      return;
    }
    setLoading(true);
    addTask(token, taskName).then((newTasks) => {
      setTasks(newTasks);
      (e.target as HTMLFormElement).reset();
    }).finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-1 flex-col justify-between bg-stone-900 shadow-lg rounded-md p-2 m-2 gap-3 text-white">
      <h1 className="font-bold text-xl">Todo</h1>
      <div className="flex flex-1 gap-1 flex-col overflow-y-scroll">
        {tasks.map((item) => (
          <TodoItem
            key={item._id.toString()}
            item={item}
            setTasks={setTasks}
            token={token}
          />
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          className="shadow bg-cyan-100 text-cyan-700 appearance-none border rounded w-full py-3 px-3 leading-tight focus:outline-none focus:shadow-outline disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
          name="taskName"
          type="text"
          placeholder="New task.."
          autoComplete="off"
          disabled={loading}
        />
        <button
          className="shadow bg-cyan-800 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-nowrap disabled:bg-slate-500 disabled:text-slate-100 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
