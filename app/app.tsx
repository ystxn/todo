"use client"

import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { Todo } from "./interfaces";
import { addTask, getTasks, toggleTask, deleteTask } from "./actions";
import { FormEvent } from "react";

interface TodoItemProps {
  item: Todo;
  setTasks: Dispatch<SetStateAction<Todo[]>>;
};
const TodoItem = ({ item, setTasks } : TodoItemProps) => {
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
    await toggleTask(id, !item.done);
  };
  const removeTask = async () => {
    setTasks((tasks) => tasks.filter(({ _id }) => _id.toString() !== id));
    await deleteTask(id);
  };

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
    getTasks(email).then((data) => setTasks(data));

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
    addTask(email, taskName).then((newTasks) => {
      setTasks(newTasks);
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
            setTasks={setTasks}
          />
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-5">
        <input
          className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
          name="taskName"
          type="text"
          placeholder="New task.."
          autoComplete="off"
          disabled={loading}
        />
        <button
          className="shadow bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-nowrap disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
          type="submit"
          disabled={loading}
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
