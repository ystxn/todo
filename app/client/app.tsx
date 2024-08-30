"use client"

import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { Todo } from '../interfaces';
import { addTask, getTasks } from '../server/actions';
import TodoItems from './todo-items';
import { polyfill } from 'mobile-drag-drop';
import { DarkIcon, LightIcon } from './icons';

interface AppProps {
  token: string;
  darkMode: boolean | null;
  setDarkMode: Dispatch<SetStateAction<boolean | null>>;
}

export default ({ token, darkMode, setDarkMode } : AppProps) => {
  const [ tasks, setTasks ] = useState([] as Todo[]);
  const [ loading, setLoading ] = useState(false);
  const effectRan = useRef(false);

  polyfill();

  useEffect(() => {
    if (effectRan.current) {
      return;
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
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
    const taskName = formData.get('taskName')?.toString();
    if (!taskName) {
      return;
    }
    setLoading(true);
    const maxOrder = tasks.reduce((max, obj) => Math.max(max, obj.order), -Infinity);
    addTask(token, maxOrder + 1, taskName).then((newTasks) => {
      setTasks(newTasks);
      (e.target as HTMLFormElement).reset();
    }).finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-1 flex-col justify-between shadow-lg rounded-md p-2 m-2 gap-3 bg-teal-50 dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-xl text-teal-700 dark:text-teal-300">
          Todo
        </h1>
        <div
          className="cursor-pointer"
          onClick={() => setDarkMode((before) => !before)}
        >
          { darkMode ? <LightIcon /> : <DarkIcon /> }
        </div>
      </div>
      <div className="flex flex-1 gap-1 flex-col overflow-y-scroll">
        <TodoItems
          tasks={tasks}
          setTasks={setTasks}
          token={token}
        />
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          className="appearance-none w-0 bg-teal-50 text-teal-700 border-teal-700 placeholder:italic placeholder:text-teal-500 placeholder:font-light focus:ring-teal-700 focus:border-teal-700 focus:shadow-none flex-1 rounded p-3 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
          name="taskName"
          type="text"
          placeholder="New task.."
          autoComplete="off"
          disabled={loading}
        />
        <button
          className="shadow bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-nowrap disabled:bg-slate-500 disabled:text-slate-100 disabled:border-slate-200 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
