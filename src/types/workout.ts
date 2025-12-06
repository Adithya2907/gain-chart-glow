export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutDay {
  date: string; // ISO date string YYYY-MM-DD
  exercises: Exercise[];
}

export interface WorkoutData {
  workouts: WorkoutDay[];
}
