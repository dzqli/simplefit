import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';

const generateId = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

type ExerciseFormProps = {
  showForm?: boolean;
  onSubmit: (data: Exercise) => void;
  onCancel: () => void;
  initial?: Exercise;
};
export default function ExerciseForm({ showForm, onSubmit, onCancel, initial }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [id, setId] = useState(initial?.id || "");
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscleGroup || "");
  const [motion, setMotion] = useState(initial?.motion || "");
  const [sets, setSets] = useState(initial?.sets || "");
  const [reps, setReps] = useState(initial?.reps || "");
  const [weight, setWeight] = useState(initial?.weight || "");

  useEffect(() => {
    setId(generateId(name));
  }, [name]);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setMuscleGroup(initial.muscleGroup ?? '');
      setMotion(initial.motion ?? '');
      setSets(initial.sets ?? '');
      setReps(initial.reps ?? '');
      setWeight(initial.weight ?? '');
    } else {
      setName("");
      setMuscleGroup("");
      setMotion("");
      setSets("");
      setReps("");
      setWeight("");
    }
  }, [initial]);

  const handleSubmit = async () => {
    if (!name || !id) return;
    onSubmit({ id, name, muscleGroup, motion });
  };

  return showForm ? (
    <form
      onSubmit={handleSubmit}
      className="fixed left-0 top-0 z-100 w-full h-full bg-white text-black p-6 flex flex-col gap-4"
    >
      <div className="w-full mb-[44px] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Add Exercise</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Key <span className='text-red-500'>*</span></label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
            value={id}
            readOnly
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name <span className='text-red-500'>*</span></label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Muscle Group</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          >
            <option value="">Select muscle group</option>
            <option value="arms">Arms</option>
            <option value="back">Back</option>
            <option value="chest">Chest</option>
            <option value="core">Core</option>
            <option value="legs">Legs</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Motion</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
          >
            <option value="">Select motion</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sets</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reps</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input
            type="number"
            step="2.5"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-end gap-2 px-6">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          onClick={() => {
            setName("");
            setId("");
            setMuscleGroup("");
            setMotion("");
            setSets("");
            setReps("");
            setWeight("");
            onCancel();
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-slate-600 hover:bg-blue-700 text-white font-semibold"
          disabled={!name || !id}
        >
          Submit
        </button>
      </div>
    </form>
  ) : null;
}
