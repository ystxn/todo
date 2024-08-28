"use client"

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Todo } from '../interfaces';
import { addTask, getTasks } from '../server/actions';
import TodoItem from './todo-item';

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
