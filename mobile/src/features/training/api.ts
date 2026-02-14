import { Workout, TrainingSession } from './types';
import { SupportedGame } from '@/src/shared/types';

let MOCK_WORKOUTS: Workout[] = [
    // League of Legends
    {
        id: 'lol-1',
        game: 'LEAGUE_OF_LEGENDS',
        title: 'Morning CS Drill',
        description: 'Wake up your hands and perfect your last hitting.',
        category: 'Warmup',
        duration: 15,
        tags: ['Mechanics', 'CSing', 'Warmup'],
        exercises: [
            {
                id: 'ex-1',
                title: 'No Items Last Hitting',
                description: 'Go into practice tool with no items and only last hit.',
                duration: 10,
                stats: [
                    { id: 'hits', type: 'SCORE', label: 'Last Hits', unit: 'CS' },
                    { id: 'accuracy', type: 'PERCENTAGE', label: 'Accuracy', unit: '%' }
                ]
            },
            {
                id: 'ex-2',
                title: 'Push & Freeze',
                description: 'Practice intentionally pushing the wave and then freezing it.',
                duration: 5,
                stats: [
                    { id: 'seconds', type: 'SCORE', label: 'Freeze duration', unit: 's' }
                ]
            }
        ]
    },
    {
        id: 'lol-2',
        game: 'LEAGUE_OF_LEGENDS',
        title: 'Jungle Clear Optimization',
        description: 'Shave seconds off your clear for better gank timings.',
        category: 'Training',
        duration: 20,
        tags: ['Macro', 'Jungle', 'Clear'],
        exercises: [
            {
                id: 'ex-3',
                title: 'Full Clear Speedrun',
                description: 'Clear all camps as fast as possible. Target: < 3:15.',
                duration: 10,
                repetitions: 2
            }
        ]
    },
    // Valorant
    {
        id: 'val-1',
        game: 'VALORANT',
        title: 'Range Warmup',
        description: 'Standard routine to get your aim crisp.',
        category: 'Warmup',
        duration: 10,
        tags: ['Aim', 'Warmup'],
        exercises: [
            {
                id: 'ex-4',
                title: 'Medium Bots',
                description: 'Hit 30 bots on Medium difficulty inside the range.',
                duration: 5
            },
            {
                id: 'ex-5',
                title: 'Recoil Control',
                description: 'Shoot at the target from 20m and try to keep grouping tight.',
                duration: 5
            }
        ]
    },
    // Rocket League
    {
        id: 'rl-1',
        game: 'ROCKET_LEAGUE',
        title: 'Aerial Control',
        description: 'Learn to fly with style and precision.',
        category: 'Training',
        duration: 30,
        tags: ['Mechanics', 'Aerials'],
        exercises: [
            {
                id: 'ex-6',
                title: 'Rings Map',
                description: 'Complete a rings map without touching the ground.',
                duration: 20
            },
            {
                id: 'ex-7',
                title: 'Wall Shots',
                description: 'Practice hitting the ball off the wall towards the goal.',
                duration: 10
            }
        ]
    }
];

let MOCK_HISTORY: TrainingSession[] = [
    {
        id: 'hist-1',
        workoutId: 'lol-1',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        duration: 16,
        status: 'COMPLETED',
        logs: [
            {
                exerciseId: 'ex-1',
                completed: true,
                actualDuration: 10,
                score: 28,
                recordedStats: {
                    1: { 'hits': '28', 'accuracy': '94' }
                }
            },
            {
                exerciseId: 'ex-2',
                completed: true,
                actualDuration: 6,
                recordedStats: {
                    1: { 'seconds': '120' }
                }
            }
        ]
    },
    {
        id: 'hist-2',
        workoutId: 'lol-1',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        duration: 14,
        status: 'COMPLETED',
        logs: [
            {
                exerciseId: 'ex-1',
                completed: true,
                actualDuration: 9,
                score: 25,
                recordedStats: {
                    1: { 'hits': '25', 'accuracy': '83' }
                }
            },
            { exerciseId: 'ex-2', completed: true, actualDuration: 5 }
        ]
    },
    {
        id: 'hist-3',
        workoutId: 'lol-1',
        date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        duration: 15,
        status: 'COMPLETED',
        logs: [
            {
                exerciseId: 'ex-1',
                completed: true,
                actualDuration: 10,
                score: 22,
                recordedStats: {
                    1: { 'hits': '22', 'accuracy': '74' }
                }
            },
            { exerciseId: 'ex-2', completed: true, actualDuration: 5 }
        ]
    }
];

export const TrainingService = {
    getWorkouts: async (game?: SupportedGame): Promise<Workout[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (game) {
            return MOCK_WORKOUTS.filter(w => w.game === game);
        }
        return MOCK_WORKOUTS;
    },

    getWorkoutById: async (id: string): Promise<Workout | null> => {
        return MOCK_WORKOUTS.find(w => w.id === id) || null;
    },

    getExerciseById: async (id: string): Promise<{ exercise: any, workout: Workout } | null> => {
        for (const workout of MOCK_WORKOUTS) {
            const exercise = workout.exercises.find(e => e.id === id);
            if (exercise) return { exercise, workout };
        }
        return null;
    },

    saveWorkout: async (workout: Workout): Promise<void> => {
        const index = MOCK_WORKOUTS.findIndex(w => w.id === workout.id);
        if (index >= 0) {
            MOCK_WORKOUTS[index] = workout;
        } else {
            MOCK_WORKOUTS.push(workout);
        }
    },

    deleteWorkout: async (id: string): Promise<void> => {
        MOCK_WORKOUTS = MOCK_WORKOUTS.filter(w => w.id !== id);
    },

    getWorkoutHistory: async (workoutId: string): Promise<TrainingSession[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_HISTORY.filter(h => h.workoutId === workoutId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getExerciseHistory: async (exerciseId: string): Promise<{ session: TrainingSession, log: any }[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const history: { session: TrainingSession, log: any }[] = [];
        for (const session of MOCK_HISTORY) {
            const log = session.logs.find(l => l.exerciseId === exerciseId);
            if (log) {
                history.push({ session, log });
            }
        }
        return history.sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime());
    },

    getSessionById: async (id: string): Promise<TrainingSession | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_HISTORY.find(h => h.id === id) || null;
    },

    saveSession: async (session: TrainingSession): Promise<void> => {
        MOCK_HISTORY.unshift(session);
    },

    updateSession: async (session: TrainingSession): Promise<void> => {
        const index = MOCK_HISTORY.findIndex(s => s.id === session.id);
        if (index >= 0) {
            MOCK_HISTORY[index] = session;
        }
    }
};
