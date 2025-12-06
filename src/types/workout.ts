export interface SetEntry {
  reps?: number;
  weight?: number;
  duration?: number; // in seconds, for timed exercises like plank
}

export interface Exercise {
  id: string;
  name: string;
  type: 'reps' | 'timed';
  sets: SetEntry[];
  notes?: string;
  order: number; // to track exercise order within the day
}

export interface WorkoutDay {
  date: string; // ISO date string YYYY-MM-DD
  exercises: Exercise[];
}

export interface WorkoutData {
  workouts: WorkoutDay[];
}
