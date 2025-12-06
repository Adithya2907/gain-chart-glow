import { useState, useEffect } from 'react';
import { WorkoutDay, Exercise } from '@/types/workout';

const STORAGE_KEY = 'gym-tracker-workouts';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setWorkouts(JSON.parse(stored));
    }
  }, []);

  const saveWorkouts = (newWorkouts: WorkoutDay[]) => {
    setWorkouts(newWorkouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTodayWorkout = (): WorkoutDay | undefined => {
    return workouts.find(w => w.date === getTodayDate());
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const today = getTodayDate();
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
    };

    const existingWorkout = workouts.find(w => w.date === today);
    
    if (existingWorkout) {
      const updatedWorkouts = workouts.map(w =>
        w.date === today
          ? { ...w, exercises: [...w.exercises, newExercise] }
          : w
      );
      saveWorkouts(updatedWorkouts);
    } else {
      saveWorkouts([...workouts, { date: today, exercises: [newExercise] }]);
    }
  };

  const removeExercise = (exerciseId: string) => {
    const today = getTodayDate();
    const updatedWorkouts = workouts.map(w =>
      w.date === today
        ? { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) }
        : w
    ).filter(w => w.exercises.length > 0);
    
    saveWorkouts(updatedWorkouts);
  };

  const getAllExerciseNames = (): string[] => {
    const names = new Set<string>();
    workouts.forEach(w => {
      w.exercises.forEach(e => names.add(e.name));
    });
    return Array.from(names).sort();
  };

  const getExerciseHistory = (exerciseName: string) => {
    return workouts
      .filter(w => w.exercises.some(e => e.name.toLowerCase() === exerciseName.toLowerCase()))
      .map(w => ({
        date: w.date,
        exercises: w.exercises.filter(e => e.name.toLowerCase() === exerciseName.toLowerCase()),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return {
    workouts,
    getTodayWorkout,
    addExercise,
    removeExercise,
    getAllExerciseNames,
    getExerciseHistory,
  };
}
