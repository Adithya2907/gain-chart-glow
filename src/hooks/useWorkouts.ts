import { useState, useEffect } from 'react';
import { WorkoutDay, Exercise, SetEntry } from '@/types/workout';

const STORAGE_KEY = 'gym-tracker-workouts-v2';

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

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => getDateString(new Date());

  const getWorkoutByDate = (date: string): WorkoutDay | undefined => {
    return workouts.find(w => w.date === date);
  };

  const getTodayWorkout = (): WorkoutDay | undefined => {
    return getWorkoutByDate(getTodayDate());
  };

  const addExercise = (exercise: Omit<Exercise, 'id' | 'order'>, date?: string) => {
    const targetDate = date || getTodayDate();
    const existingWorkout = workouts.find(w => w.date === targetDate);
    const currentOrder = existingWorkout?.exercises.length || 0;
    
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      order: currentOrder,
    };

    if (existingWorkout) {
      const updatedWorkouts = workouts.map(w =>
        w.date === targetDate
          ? { ...w, exercises: [...w.exercises, newExercise] }
          : w
      );
      saveWorkouts(updatedWorkouts);
    } else {
      saveWorkouts([...workouts, { date: targetDate, exercises: [newExercise] }]);
    }
  };

  const removeExercise = (exerciseId: string, date?: string) => {
    const targetDate = date || getTodayDate();
    const updatedWorkouts = workouts.map(w =>
      w.date === targetDate
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

  const getDaysWithWorkouts = (): string[] => {
    return workouts.map(w => w.date);
  };

  return {
    workouts,
    getTodayWorkout,
    getWorkoutByDate,
    addExercise,
    removeExercise,
    getAllExerciseNames,
    getExerciseHistory,
    getDaysWithWorkouts,
  };
}
