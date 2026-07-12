import { useState, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  addMonths, subMonths
} from 'date-fns'
import { useWorkouts } from '../context/WorkoutContext'
import { EXERCISE_NAMES, EXERCISE_DATA } from '../data/exerciseData'

const INTENSITY_OPTIONS = [
  { value: 'light',    label: 'Light',    sub: 'RPE 5–6' },
  { value: 'moderate', label: 'Moderate', sub: 'RPE 7–8' },
  { value: 'heavy',    label: 'Heavy',    sub: 'RPE 8–10' },
]

function ExerciseRow({ entry, onUpdate, onRemove }) {
  return (
    <div className="ex-row">
      <div className="ex-name">
        <span>{entry.name}</span>
        <span className="ex-primary">{EXERCISE_DATA[entry.name]?.primaryGroup}</span>
      </div>
      <div className="ex-controls">
        <label className="ex-control-label">Sets</label>
        <input type="number" min={1} max={10} value={entry.sets} className="ex-input"
          onChange={e => onUpdate({ ...entry, sets: parseInt(e.target.value) || 1 })} />
        <label className="ex-control-label">Intensity</label>
        <select className="select select--sm" value={entry.intensity}
          onChange={e => onUpdate({ ...entry, intensity: e.target.value })}>
          {INTENSITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label} ({o.sub})</option>
          ))}
        </select>
        <button className="btn-icon btn-icon--danger" onClick={onRemove} title="Remove">×</button>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { workouts, dispatch, badSleepDates, sleepDispatch } = useWorkouts()
  const [currentMonth, setCurrentMonth]     = useState(new Date())
  const [selectedDate, setSelectedDate]     = useState(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [draftExercises, setDraftExercises] = useState([])
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end   = endOfWeek(endOfMonth(currentMonth),   { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const workoutsByDate = useMemo(() => {
    const map = {}
    for (const w of workouts) map[w.date] = w
    return map
  }, [workouts])

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
    setDraftExercises(workoutsByDate[dateStr] ? [...workoutsByDate[dateStr].exercises] : [])
    setExerciseSearch('')
  }

  const addExercise = (name) => {
    if (draftExercises.some(e => e.name === name)) return
    setDraftExercises(prev => [...prev, { name, sets: 3, intensity: 'moderate' }])
    setExerciseSearch('')
  }

  const saveWorkout = () => {
    if (!selectedDate) return
    if (draftExercises.length === 0) dispatch({ type: 'REMOVE_WORKOUT', date: selectedDate })
    else dispatch({ type: 'ADD_WORKOUT', workout: { date: selectedDate, exercises: draftExercises } })
    setSelectedDate(null)
  }

  const filteredExercises = EXERCISE_NAMES.filter(n =>
    n.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
    !draftExercises.some(e => e.name === n)
  )

  return (
    <div className="calendar-layout">

      {/* Calendar */}
      <div className="calendar-panel">
        <div className="panel-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 className="panel-title">Workout Calendar</h2>
            <p className="panel-subtitle">Click a day to log exercises</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button className="btn-icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>‹</button>
            <span style={{ fontFamily:'Inter', fontWeight:700, color:'#f0f4ff', fontSize:13, minWidth:110, textAlign:'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button className="btn-icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>›</button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="cal-weekdays">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="cal-grid">
          {days.map(day => {
            const dateStr    = format(day, 'yyyy-MM-dd')
            const hasWorkout = !!workoutsByDate[dateStr]
            const isSelected = selectedDate === dateStr
            const inMonth    = isSameMonth(day, currentMonth)
            const todayDay   = isToday(day)
            return (
              <button key={dateStr} onClick={() => handleDayClick(day)}
                className={[
                  'cal-day',
                  inMonth ? '' : 'cal-day--out',
                  hasWorkout ? 'cal-day--workout' : '',
                  isSelected ? 'cal-day--selected' : '',
                  todayDay   ? 'cal-day--today' : '',
                ].join(' ')}>
                <span className="cal-day-num">{format(day, 'd')}</span>
                {badSleepDates.includes(dateStr) && (
                  <span className="cal-day-sleep" title="Poor sleep logged">🌙</span>
                )}
                {hasWorkout && (
                  <div className="workout-dots">
                    {workoutsByDate[dateStr].exercises.slice(0, 3).map((_, i) => (
                      <div key={i} className="workout-dot" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Summary + clear */}
        <div className="cal-summary">
          <div className="summary-stats">
            <span className="summary-stat"><strong>{workouts.length}</strong> sessions</span>
            <span className="summary-stat"><strong>
              {[...new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))].length}
            </strong> exercises used</span>
          </div>
          {workouts.length > 0 && (
            !showConfirmClear ? (
              <button className="btn btn--danger-ghost" onClick={() => setShowConfirmClear(true)}>
                Clear All
              </button>
            ) : (
              <div className="confirm-clear">
                <span>Sure?</span>
                <button className="btn btn--danger" onClick={() => {
                  dispatch({ type: 'CLEAR_ALL' }); setShowConfirmClear(false); setSelectedDate(null)
                }}>Yes</button>
                <button className="btn btn--ghost" onClick={() => setShowConfirmClear(false)}>No</button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Workout editor */}
      <div className="workout-panel">
        {selectedDate ? (
          <>
            <div className="panel-header" style={{ padding:'0 0 14px' }}>
              <h2 className="panel-title">{format(new Date(selectedDate + 'T00:00'), 'EEEE, d MMMM yyyy')}</h2>
              <p className="panel-subtitle">Add exercises performed in this session</p>
            </div>

            {/* Sleep toggle */}
            <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
              <div>
                <div className="card-label" style={{ marginBottom: 2 }}>Sleep Quality</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  Poor sleep slows recovery for 24 hours
                </div>
              </div>
              <button
                className={badSleepDates.includes(selectedDate) ? 'btn btn--primary' : 'btn btn--ghost'}
                style={{ gap: 6, display:'flex', alignItems:'center' }}
                onClick={() => sleepDispatch(
                  badSleepDates.includes(selectedDate)
                    ? { type: 'REMOVE_BAD_SLEEP', date: selectedDate }
                    : { type: 'ADD_BAD_SLEEP',    date: selectedDate }
                )}
              >
                {badSleepDates.includes(selectedDate) ? 'Poor sleep logged' : 'Log poor sleep'}
              </button>
            </div>

            {/* Exercise picker */}
            <div className="card">
              <div className="card-label" style={{ marginBottom: 10 }}>Add Exercise</div>
              <input type="text" className="search-input" placeholder="Search exercises…"
                value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} />

              {exerciseSearch ? (
                <div className="exercise-dropdown">
                  {filteredExercises.slice(0, 8).map(name => (
                    <button key={name} className="exercise-option" onClick={() => addExercise(name)}>
                      <span>{name}</span>
                      <span className="ex-cat">{EXERCISE_DATA[name]?.category}</span>
                    </button>
                  ))}
                  {filteredExercises.length === 0 && <div className="no-results">No exercises found</div>}
                </div>
              ) : (
                <div className="quick-add-grid">
                  {EXERCISE_NAMES.filter(n => !draftExercises.some(e => e.name === n)).map(name => (
                    <button key={name} className="quick-add-chip" onClick={() => addExercise(name)}>
                      + {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Session exercises */}
            <div className="card">
              <div className="card-label" style={{ marginBottom: 12 }}>
                Session Exercises {draftExercises.length > 0 && `(${draftExercises.length})`}
              </div>
              {draftExercises.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 12, padding: '12px 0' }}>No exercises added yet</div>
              ) : (
                <div className="exercise-list">
                  {draftExercises.map((entry, idx) => (
                    <ExerciseRow key={entry.name} entry={entry}
                      onUpdate={updated => setDraftExercises(prev => prev.map((e, i) => i === idx ? updated : e))}
                      onRemove={() => setDraftExercises(prev => prev.filter((_, i) => i !== idx))} />
                  ))}
                </div>
              )}
            </div>

            <div className="workout-actions">
              {workoutsByDate[selectedDate] && (
                <button className="btn btn--danger-ghost"
                  onClick={() => { dispatch({ type:'REMOVE_WORKOUT', date:selectedDate }); setSelectedDate(null) }}>
                  Remove Day
                </button>
              )}
              <button className="btn btn--ghost" onClick={() => setSelectedDate(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={saveWorkout}
                disabled={draftExercises.length === 0 && !workoutsByDate[selectedDate]}>
                Save Workout
              </button>
            </div>
          </>
        ) : (
          <div className="workout-empty">
            <div className="workout-empty-title">Select a Day</div>
            <div className="workout-empty-desc">
              Click any date on the calendar to log your exercises.
              Sessions feed directly into the Activation and Recovery visualisations.
            </div>
            {workouts.length > 0 && (
              <div className="recent-workouts">
                <div className="card-label" style={{ marginBottom: 10 }}>Recent Sessions</div>
                {workouts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map(w => (
                  <div key={w.date} className="recent-row"
                    onClick={() => handleDayClick(new Date(w.date + 'T00:00'))}>
                    <span className="recent-date">{format(new Date(w.date + 'T00:00'), 'd MMM yyyy')}</span>
                    <span className="recent-exes">{w.exercises.map(e => e.name).join(', ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
