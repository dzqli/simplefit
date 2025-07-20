import React from "react";
import { Exercise } from "../types";
import TrashIcon from "@/assets/trash";
import PencilIcon from "@/assets/pencil";
import UpChevron from "@/assets/upchevron";

interface ExerciseRowProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onSave: (exercise: Exercise) => void;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({ exercise, onEdit, onDelete, onSave }) => {
  const [sets, setSets] = React.useState(exercise.sets || 0);
  const [reps, setReps] = React.useState(exercise.reps || 0);
  const [weight, setWeight] = React.useState(exercise.weight || 0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <li className="bg-slate-300 border rounded">
      <button
        type="button"
        className="w-full p-3 text-slate-900 hover:bg-gray-100 flex justify-between items-center"
        onClick={() => {
          setIsExpanded(prev => !prev);
          if (!isExpanded) {
            setSets(exercise.sets || 0);
            setReps(exercise.reps || 0);
            setWeight(exercise.weight || 0);
          }
        }}
      >
        <span className="font-bold">{exercise.name}</span>
        {isExpanded ? (
          <span className="animate-bounce text-xl"><UpChevron className="size-4" /></span>
        ) : (
          <div className="flex gap-4">
            <div>
              <span className="font-semibold hidden md:inline">Sets:</span>
              <span className="font-semibold inline md:hidden">S:</span> {exercise.sets}
            </div>
            <div>
              <span className="font-semibold hidden md:inline">Reps:</span>
              <span className="font-semibold inline md:hidden">R:</span> {exercise.reps}
            </div>
            <div>
              <span className="font-semibold hidden md:inline">Weight:</span>
              <span className="font-semibold inline md:hidden">W:</span> {exercise.weight}
            </div>
          </div>
        )}
      </button>
      {isExpanded && (
        <>
          <div className="flex gap-6 p-4 justify-around flex-wrap w-full text-slate-900">
            <div className="flex flex-col items-center">
              <label className="mb-2 font-semibold">Sets</label>
              <div className="flex items-stretch">
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-l w-5 flex justify-center items-center"
                  onClick={() => setSets(prev => Math.max(prev - 1, 0))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-20 bg-white text-center text-xl p-2"
                  value={sets}
                  min={0}
                  onChange={e => setSets(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-r w-5 flex justify-center items-center"
                  onClick={() => setSets(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-2 font-semibold">Reps</label>
              <div className="flex items-stretch">
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-l w-5 flex justify-center items-center"
                  onClick={() => setReps(prev => Math.max(prev - 1, 0))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-20 bg-white text-center text-xl p-2"
                  value={reps}
                  min={0}
                  onChange={e => setReps(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-r w-5 flex justify-center items-center"
                  onClick={() => setReps(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-2 font-semibold">Weight</label>
              <div className="flex items-stretch">
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-l w-5 flex justify-center items-center"
                  onClick={() => setWeight(prev => Math.max(prev - 2.5, 0))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-20 bg-white text-center text-xl p-2"
                  value={weight}
                  min={0}
                  step={2.5}
                  onChange={e => setWeight(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded-r w-5 flex justify-center items-center"
                  onClick={() => setWeight(prev => prev + 2.5)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="p-3 flex items-center justify-end gap-2 border-t bg-slate-200 rounded-b">
            <button
              type="button"
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => onSave({ ...exercise, sets, reps, weight })}
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-300 text-black rounded hover:bg-gray-500 hover:text-white transition flex items-center"
              onClick={() => onEdit(exercise)}
              title="Edit"
            >
              <PencilIcon className="size-5" />
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-300 text-red-500 rounded hover:bg-gray-500 hover:text-red-300 transition flex items-center"
              onClick={async () => {
                onDelete(exercise);
                setIsExpanded(false);
              }}
              title="Delete"
            >
              <TrashIcon className="size-5" />
            </button>
            </div>
        </>
      )}
    </li>
  );
};

export default ExerciseRow;
