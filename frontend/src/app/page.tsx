"use client";

import { useState } from "react";
import ExerciseForm from "@/app/components/ExerciseForm";
import { Exercise } from "./types";
import { SessionProvider } from "next-auth/react";
import SignIn from "./components/SignInButton";

export default function Home() {
  const exercises = [
    { id: 'push-up', name: "Push-up", reps: 10, sets: 3, weight: 50 },
    { id: 'squat', name: "Squat", reps: 15, sets: 3, weight: 110 },
    { id: 'lunge', name: "Lunge", reps: 12, sets: 3, weight: 30 },
    { id: 'plank', name: "Plank", reps: 1, sets: 3, weight: 45 },
    { id: 'burpee', name: "Burpee", reps: 8, sets: 3, weight: 35 },
  ];
  const [showForm, setShowForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();
  const handleAddExercise = () => setShowForm(true);
  return (
    <SessionProvider>
      <div className="min-h-screen bg-black-50 p-4">
        <ExerciseForm showForm={showForm} initial={selectedExercise} onSubmit={(a) => console.log(a)} onCancel={() => { setShowForm(false); setSelectedExercise(undefined)}} />
        <div className="relative max-w-2xl mx-auto">
          <section className="absolute top-0 right-0 flex items-center gap-2">
            <button className="text-white bg-slate-600 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-md" onClick={handleAddExercise}>
              + Add Exercise
            </button>
            <SignIn className="bg-slate-600 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-md" />
          </section>
          <header className="md:text-center mb-6 mt-4">
            <h1 className="hidden md:block text-4xl font-bold text-slate-300">simplefit.</h1>
            <h1 className="block md:hidden text-4xl font-bold text-slate-300">s.fit.</h1>
          </header>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search exercises..."
              className="w-full max-w-md mx-auto block p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {exercises.length === 0 ? (
            <p className="text-center text-gray-500">Add an exercise to get started.</p>
          ) : (
            <ul className="space-y-2">
              {exercises.map((exercise, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="w-full p-3 text-slate-900 bg-slate-300 border rounded hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setShowForm(true);
                      }}
                      >
                      <span className="font-bold">{exercise.name}</span>
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
                    </button>
                  </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SessionProvider>
  );
}
