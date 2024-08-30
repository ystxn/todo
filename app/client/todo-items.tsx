import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Todo } from "../interfaces";
import { deleteTask, toggleTask, renameTask, updateOrder } from "../server/actions";

interface TodoItemProps {
  tasks: Todo[];
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

export default ({ tasks, setTasks, token }: TodoItemProps) => {
  const [ editId, setEditId ] = useState('');
  const [ dragAndDrop, setDragAndDrop ] = useState({
    draggedFrom: 0,
    draggedTo: 0,
    isDragging: false,
    originalOrder: [] as Todo[],
    updatedOrder: [] as Todo[],
  });

  const toggle = async (item : Todo) => {
    setTasks((tasks) =>
      tasks
        .map((task) =>
          task._id !== item._id ? task : { ...task, done: !item.done }
        )
        .toSorted((a, b) => {
          if (a.done !== b.done) {
            return a.done ? 1 : -1;
          }
          if (a.order !== b.order) {
            return b.order - a.order;
          }
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        })
    );
    await toggleTask(token, item._id.toString(), !item.done);
  };

  const removeTask = async (item : Todo) => {
    const id = item._id.toString();
    setTasks((tasks) => tasks.filter(({ _id }) => _id.toString() !== id));
    await deleteTask(token, id);
  };

  const editTask = async (item : Todo) => {
    const id = item._id.toString();
    const input = document.querySelector("input[name=editor]");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const newTaskName = input.value.trim();

    setEditId('');
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
    if (editId === '') {
      return;
    }
    const input = document.querySelector("input[name=editor]");
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }, [ editId ]);

  const onDragEnter = (event : React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const onDragStart = (event : React.DragEvent<HTMLElement>) => {
    const initialPosition = Number(event.currentTarget.dataset.position);
    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: tasks,
    });
    event.dataTransfer.setData('text/html', '');
  };

  const onDragOver = (event : React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    let newList = dragAndDrop.originalOrder;
    const draggedFrom = dragAndDrop.draggedFrom;
    const draggedTo = Number(event.currentTarget.dataset.position);
    const itemDragged = newList[draggedFrom];
    const remainingItems = newList.filter((_, index) => index !== draggedFrom);
    newList = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo)
    ];

    if (draggedTo !== dragAndDrop.draggedTo) {
      setDragAndDrop({
        ...dragAndDrop,
        updatedOrder: newList,
        draggedTo: draggedTo
      });
    }
  };

  const onDrop = async () => {
    const length = dragAndDrop.updatedOrder.length;
    const orderedList = dragAndDrop.updatedOrder
      .map((item, index) => ({ ...item, order: length - index }))
      .toSorted((a, b) => {
        if (a.done !== b.done) {
          return a.done ? 1 : -1;
        }
        return b.order - a.order;
      })
      .map((item, index) => ({ ...item, order: length - index }));
    setTasks(orderedList);
    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: 0,
      draggedTo: 0,
      isDragging: false,
    });

    updateOrder(token, orderedList.map(({ _id, order }) => ({ id: _id.toString(), order })));
  };

  return tasks.map((item, index) => (
    <div
      key={item._id.toString()}
      data-position={index}
      className="flex items-center mb-4 mt-1 ml-1"
      draggable="true"
      onDragEnter={onDragEnter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        checked={item.done}
        onChange={() => toggle(item)}
        type="checkbox"
        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
      />
      {editId !== item._id.toString() ? (
        <label
          onDoubleClick={() => setEditId(item._id.toString())}
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
          onBlur={() => editTask(item)}
        />
      )}
      {item.done && (
        <button
          className="text-red-700 hover:text-red-500 mx-4"
          onClick={() => removeTask(item)}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  ));
};
