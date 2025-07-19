"use client";

import { useState } from "react";
import ExerciseForm from "@/app/components/ExerciseForm";
import { Exercise } from "./types";
import useSWR from 'swr'
import SignIn from "./components/SignInButton";
import ExerciseRow from "./components/ExerciseRow";

const fetcher = () => fetch('/api/exercises').then((r) => r.json());

export default function Home() {
  const { data: exercises, isLoading } = useSWR<Exercise[]>(
    '/api/exercises',
    fetcher
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();
  const handleAddExercise = () => setShowForm(true);

  const handleSubmit = (data: Exercise) => {
    try {
      fetch(`/api/exercises/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Failed to submit exercise:", error);
    } finally {
      setShowForm(false);
      setSelectedExercise(undefined);
    };
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-r-4 border-blue-500"></div>
    </div>
  )
  return (
    <div className="min-h-screen bg-black-50 p-4">
      <ExerciseForm showForm={showForm} initial={selectedExercise} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setSelectedExercise(undefined)}} />
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
        {exercises?.length ? (
          <ul className="space-y-2">
            {exercises?.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                onEdit={() => {
                  setSelectedExercise(exercise);
                  setShowForm(true);
                }}
                onDelete={() => null}
                onSave={() => null}
              />
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Add an exercise to get started.</p>
        )}
      </div>
    </div>
  );
}
