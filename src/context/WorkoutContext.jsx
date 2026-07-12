import { createContext, useContext, useReducer, useEffect } from 'react'

const WorkoutContext = createContext(null)

const STORAGE_KEY       = 'visualising_strength_workouts'
const SLEEP_STORAGE_KEY = 'visualising_strength_bad_sleep'

function loadWorkouts() {
  try { const r = localStorage.getItem(STORAGE_KEY);       return r ? JSON.parse(r) : [] } catch { return [] }
}
function loadSleepDates() {
  try { const r = localStorage.getItem(SLEEP_STORAGE_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}

function workoutReducer(state, action) {
  switch (action.type) {
    case 'ADD_WORKOUT': {
      const exists = state.findIndex(w => w.date === action.workout.date)
      if (exists >= 0) {
        const next = [...state]
        next[exists] = action.workout
        return next
      }
      return [...state, action.workout]
    }
    case 'REMOVE_WORKOUT':
      return state.filter(w => w.date !== action.date)
    case 'CLEAR_ALL':
      return []
    case 'LOAD':
      return action.workouts
    default:
      return state
  }
}

function sleepReducer(state, action) {
  switch (action.type) {
    case 'ADD_BAD_SLEEP':
      return state.includes(action.date) ? state : [...state, action.date]
    case 'REMOVE_BAD_SLEEP':
      return state.filter(d => d !== action.date)
    case 'CLEAR_ALL':
      return []
    default:
      return state
  }
}

export function WorkoutProvider({ children }) {
  const [workouts,      dispatch]      = useReducer(workoutReducer, [], loadWorkouts)
  const [badSleepDates, sleepDispatch] = useReducer(sleepReducer,   [], loadSleepDates)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
  }, [workouts])

  useEffect(() => {
    localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(badSleepDates))
  }, [badSleepDates])

  return (
    <WorkoutContext.Provider value={{ workouts, dispatch, badSleepDates, sleepDispatch }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  return useContext(WorkoutContext)
}
