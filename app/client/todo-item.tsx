import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Todo } from "../interfaces";
import { deleteTask, toggleTask, renameTask } from "../server/actions";

interface TodoItemProps {
  item: Todo;
  setTasks: Dispatch<SetStateAction<Todo[]>>;
  token: string;
}

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
    />
  </svg>
);

export default ({ item, setTasks, token }: TodoItemProps) => {
  const [editMode, setEditMode] = useState(false);
  const id = item._id.toString();

  const toggle = async () => {
    setTasks((tasks) =>
      tasks
        .map((task) =>
          task._id !== item._id ? task : { ...task, done: !item.done }
        )
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

  const editTask = async () => {
    const input = document.querySelector("input[name=editor]");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const newTaskName = input.value.trim();

    setEditMode(false);
    if (item.name !== newTaskName) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task._id !== item._id ? task : { ...task, name: newTaskName }
        )
      );
      await renameTask(token, id, newTaskName);
    }
  };

  useEffect(() => {
    if (!editMode) {
      return;
    }
    const input = document.querySelector("input[name=editor]");
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }, [editMode]);

  return (
    <div className="flex items-center mb-4 mt-1 ml-1">
      <input
        id={id}
        checked={item.done}
        onChange={toggle}
        type="checkbox"
        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
      />
      {!editMode ? (
        <label
          onDoubleClick={() => setEditMode(true)}
          className={`ms-2 text-sm font-medium cursor-pointer w-full select-none ${
            item.done && "text-gray-400 line-through"
          }`}
        >
          {item.name}
        </label>
      ) : (
        <input
          name="editor"
          className="shadow bg-slate-100 text-black appearance-none border rounded w-full py-1 px-1 mx-2 leading-tight"
          defaultValue={item.name}
          onBlur={editTask}
        />
      )}
      {item.done && (
        <button
          className="text-red-700 hover:text-red-500 mx-4"
          onClick={removeTask}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};
