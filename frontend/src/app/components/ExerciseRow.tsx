import React from "react";
import { Exercise } from "../types";
import TrashIcon from "@/assets/trash";
import PencilIcon from "@/assets/pencil";

interface ExerciseRowProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
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
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span className="font-bold">{exercise.name}</span>
        {isExpanded ? (
          <span className="animate-bounce text-xl">&#9650;</span>
        ) : (
          <div className="flex gap-4">
            <div>
              <span className="font-semibold">Sets:</span> {exercise.sets}
            </div>
            <div>
              <span className="font-semibold">Reps:</span> {exercise.reps}
            </div>
            <div>
              <span className="font-semibold">Weight:</span> {exercise.weight}
            </div>
          </div>
        )}
      </button>
      {isExpanded && (
        <>
          <div>
            <div className="flex gap-6 p-4">
              <div className="flex flex-col items-center">
                <label className="mb-2 font-semibold">Sets</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-l"
                    onClick={() => setSets(prev => Math.max(prev - 1, 0))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center text-xl p-2 border-y border-gray-300"
                    value={sets}
                    min={0}
                    onChange={e => setSets(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-r"
                    onClick={() => setSets(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <label className="mb-2 font-semibold">Reps</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-l"
                    onClick={() => setReps(prev => Math.max(prev - 1, 0))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center text-xl p-2 border-y border-gray-300"
                    value={reps}
                    min={0}
                    onChange={e => setReps(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-r"
                    onClick={() => setReps(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <label className="mb-2 font-semibold">Weight</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-l"
                    onClick={() => setWeight(prev => Math.max(prev - 2.5, 0))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center text-xl p-2 border-y border-gray-300"
                    value={weight}
                    min={0}
                    step={2.5}
                    onChange={e => setWeight(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 rounded-r"
                    onClick={() => setWeight(prev => prev + 2.5)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 flex items-center justify-end gap-2 border-t bg-slate-200 rounded-b">
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={() => onSave({ ...exercise, sets, reps, weight })}
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
              onClick={() => onEdit(exercise)}
              title="Edit"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
              onClick={() => onDelete(exercise.id)}
              title="Delete"
            >
              <TrashIcon />
            </button>
            </div>
        </>
      )}
    </li>
  );
};

export default ExerciseRow;
