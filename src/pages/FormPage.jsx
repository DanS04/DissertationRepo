import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { EXERCISE_DATA, EXERCISE_NAMES, EXERCISE_CATEGORIES } from '../data/exerciseData'
import { MUSCLE_CONFIG } from '../data/muscleConfig'
import { activationColour } from '../utils/colourUtils'
import { useWorkouts } from '../context/WorkoutContext'

// Maps website exercise names to dataset folder names, would need expanded on addition of exercises to emg dataset
const EXERCISE_FOLDER_MAP = {
  'Bench Press':               'Barbell_Bench_Press_-_Medium_Grip',
  'Incline Bench Press':       'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Squat':                     'Barbell_Squat',
  'Deadlift':                  'Barbell_Deadlift',
  'Pull-Up':                   'Pullups',
  'Shoulder Press':            'Barbell_Shoulder_Press',
  'Lateral Raise':             'Side_Lateral_Raise',
  'Bicep Curl':                'Barbell_Curl',
  'Tricep Pushdown':           'Triceps_Pushdown',
  'Romanian Deadlift':         'Romanian_Deadlift',
  'Bent-Over Row':             'Bent_Over_Barbell_Row',
  'Leg Press':                 'Leg_Press',
  'Face Pull':                 'Face_Pull',
  'Plank':                     'Plank',
  'Cable Row':                 'Seated_Cable_Rows',
  'Hip Thrust':                'Barbell_Hip_Thrust',
  'Overhead Tricep Extension': 'Overhead_Triceps',
  'Lunges':                    'Barbell_Lunge',
  'Cable Fly':                 'Flat_Bench_Cable_Flyes',
  'Upright Row':               'Upright_Barbell_Row',
}

const LEVEL_STYLE = {
  beginner:     { bg: 'rgba(16,185,129,0.15)', colour: '#10b981', border: 'rgba(16,185,129,0.3)' },
  intermediate: { bg: 'rgba(245,158,11,0.15)', colour: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  expert:       { bg: 'rgba(239,68,68,0.15)',  colour: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

function ExerciseForm({ exerciseName, folder, onClose }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    setLoading(true)
    setInfo(null)
    setImgIdx(0)
    fetch(`/exercises/${folder}/exercise.json`)
      .then(r => r.json())
      .then(data => { setInfo(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [folder])

  if (loading) {
    return (
      <div className="form-placeholder">
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading…</div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="form-placeholder">
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Form data not available.</div>
      </div>
    )
  }

  const lvlStyle = LEVEL_STYLE[info.level] ?? LEVEL_STYLE.intermediate

  return (
    <div className="form-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            {exerciseName}
          </h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {info.equipment && (
              <span className="badge badge--category" style={{ textTransform: 'capitalize' }}>{info.equipment}</span>
            )}
            {info.level && (
              <span className="badge" style={{ background: lvlStyle.bg, color: lvlStyle.colour, border: `1px solid ${lvlStyle.border}`, textTransform: 'capitalize' }}>
                {info.level}
              </span>
            )}
            {info.mechanic && (
              <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', textTransform: 'capitalize' }}>
                {info.mechanic}
              </span>
            )}
            {info.force && (
              <span className="badge" style={{ background: 'rgba(100,140,200,0.12)', color: 'var(--text-sub)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
                {info.force}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text-sub)', cursor: 'pointer', padding: '4px 10px', fontSize: 12, flexShrink: 0,
          }}>✕ close</button>
        )}
      </div>

      {/* Images from the exercises dataset */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <span className="card-label">Form Images</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1].map(i => (
              <button key={i} onClick={() => setImgIdx(i)}
                style={{
                  padding: '2px 8px', borderRadius: 4, border: '1px solid',
                  borderColor: imgIdx === i ? 'var(--accent)' : 'var(--border)',
                  background: imgIdx === i ? 'var(--accent-dim)' : 'none',
                  color: imgIdx === i ? 'var(--accent)' : 'var(--text-sub)',
                  fontSize: 10, cursor: 'pointer', fontFamily: 'Inter',
                }}>
                {i === 0 ? 'Start' : 'End'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              borderRadius: 8, overflow: 'hidden',
              border: `2px solid ${imgIdx === i ? 'var(--accent)' : 'var(--border)'}`,
              background: 'var(--surface)', transition: 'border-color 0.15s',
              cursor: 'pointer',
            }} onClick={() => setImgIdx(i)}>
              <img
                src={`/exercises/${folder}/images/${i}.jpg`}
                alt={`${exerciseName}, ${i === 0 ? 'start' : 'end'} position`}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
              <div style={{
                padding: '5px 10px', fontSize: 10, textTransform: 'uppercase',
                letterSpacing: '0.6px', color: imgIdx === i ? 'var(--accent)' : 'var(--text-dim)',
                fontWeight: 600, background: 'var(--card)',
              }}>
                {i === 0 ? 'Start Position' : 'End Position'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscles from EMG dataset */}
      {(() => {
        const emgMuscles = EXERCISE_DATA[exerciseName]?.muscles
        if (!emgMuscles || Object.keys(emgMuscles).length === 0) return null
        const sorted = Object.entries(emgMuscles)
          .map(([id, val]) => ({ id, val, displayName: MUSCLE_CONFIG[id]?.displayName ?? id, group: MUSCLE_CONFIG[id]?.group ?? '' }))
          .sort((a, b) => b.val - a.val)
        return (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <span className="card-label">Muscles Worked</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>% MVC (EMG)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sorted.map(({ id, val, displayName, group }) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: activationColour(val) }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{displayName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', marginRight: 4 }}>{group}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: activationColour(val), minWidth: 36, textAlign: 'right' }}>
                    {val}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Instructions taken from exercise dataset */}
      {info.instructions?.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <span className="card-label">Step-by-Step Instructions</span>
          </div>
          <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {info.instructions.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--accent-dim)', border: '1px solid var(--border-hi)',
                  color: 'var(--accent)', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono', marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.65, flex: 1 }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function FormPage() {
  const { workouts } = useWorkouts()
  const [viewMode, setViewMode]           = useState('exercise')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(null)
  const [selectedWorkoutExercise, setSelectedWorkoutExercise] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')

  const recentWorkouts = useMemo(() =>
    workouts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
  [workouts])

  const handleViewMode = (mode) => {
    setViewMode(mode)
    if (mode === 'workout' && !selectedWorkoutDate && recentWorkouts.length > 0) {
      setSelectedWorkoutDate(recentWorkouts[0].date)
    }
  }

  const selectedWorkout = useMemo(() =>
    workouts.find(w => w.date === selectedWorkoutDate) ?? null,
  [workouts, selectedWorkoutDate])

  // Only exercises in the workout that have form data available
  const workoutExercisesWithForm = useMemo(() => {
    if (!selectedWorkout) return []
    return selectedWorkout.exercises.filter(ex => EXERCISE_FOLDER_MAP[ex.name])
  }, [selectedWorkout])

  // Reset exercise selection when workout changes
  useEffect(() => {
    setSelectedWorkoutExercise(null)
  }, [selectedWorkoutDate])

  const filteredExercises = useMemo(() =>
    categoryFilter === 'All' ? EXERCISE_NAMES
      : EXERCISE_NAMES.filter(n => EXERCISE_DATA[n].category === categoryFilter),
  [categoryFilter])

  const activeExerciseName = viewMode === 'exercise'
    ? selectedExercise
    : selectedWorkoutExercise

  const activeFolder = activeExerciseName ? EXERCISE_FOLDER_MAP[activeExerciseName] : null

  return (
    <div className="page-layout">
      <div className="form-page-layout">

        {/* Source selector */}
        <div className="form-selector-panel">
          <div className="card" style={{ flexShrink: 0 }}>
            <div className="card-header">
              <span className="card-label">Select Form Source</span>
            </div>

            {/* Mode toggle */}
            <div className="tab-row" style={{ marginBottom: 10 }}>
              <button className={`tab ${viewMode === 'exercise' ? 'tab--active' : ''}`}
                onClick={() => handleViewMode('exercise')}>Single Exercise</button>
              <button className={`tab ${viewMode === 'workout' ? 'tab--active' : ''}`}
                onClick={() => handleViewMode('workout')}>Recent Workout</button>
            </div>

            {viewMode === 'exercise' ? (
              <>
                <div className="tab-row">
                  {['All', ...EXERCISE_CATEGORIES].map(cat => (
                    <button key={cat}
                      className={`tab ${categoryFilter === cat ? 'tab--active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
                <select className="select" value={selectedExercise ?? ''}
                  onChange={e => setSelectedExercise(e.target.value || null)}>
                  <option value="">Select an exercise</option>
                  {filteredExercises.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {EXERCISE_DATA[selectedExercise] && (
                  <div className="exercise-meta">
                    <span className="meta-item">Category: <strong>{EXERCISE_DATA[selectedExercise].category}</strong></span>
                    <span className="meta-item">Primary: <strong>{EXERCISE_DATA[selectedExercise].primaryGroup}</strong></span>
                  </div>
                )}
              </>
            ) : (
              recentWorkouts.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 12, padding: '10px 0' }}>
                  No workouts logged yet. Add sessions in the Calendar tab.
                </div>
              ) : (
                <>
                  {/* Workout list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                    {recentWorkouts.map(w => {
                      const isSelected = w.date === selectedWorkoutDate
                      return (
                        <button key={w.date} onClick={() => setSelectedWorkoutDate(w.date)}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left',
                            padding: '7px 10px', borderRadius: 6, border: '1px solid',
                            borderColor: isSelected ? 'var(--accent)' : 'rgba(100,140,200,0.12)',
                            background: isSelected ? 'rgba(0,229,212,0.07)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                          }}>
                          <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                            color: isSelected ? 'var(--accent)' : '#c4cfe0' }}>
                            {format(new Date(w.date + 'T00:00'), 'EEE, d MMM yyyy')}
                          </span>
                          <span style={{ fontSize: 11, color: '#7a8fb5',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {w.exercises.map(e => e.name).join(' · ')}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Exercise picker for selected workout */}
                  {selectedWorkout && (
                    <div>
                      <div style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.6px', color: 'var(--text-sub)', marginBottom: 6,
                      }}>
                        Exercises in this session
                      </div>
                      {workoutExercisesWithForm.length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '6px 0' }}>
                          No form data available for exercises in this workout.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {workoutExercisesWithForm.map(ex => {
                            const isSelected = selectedWorkoutExercise === ex.name
                            return (
                              <button key={ex.name}
                                onClick={() => setSelectedWorkoutExercise(ex.name)}
                                style={{
                                  textAlign: 'left', padding: '7px 10px', borderRadius: 6,
                                  border: '1px solid',
                                  borderColor: isSelected ? 'var(--accent)' : 'rgba(100,140,200,0.12)',
                                  background: isSelected ? 'rgba(0,229,212,0.07)' : 'rgba(255,255,255,0.02)',
                                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                                  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                                  fontFamily: 'Inter',
                                }}>
                                {ex.name}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Exercises in workout without form data (greyed out) */}
                      {selectedWorkout.exercises.filter(ex => !EXERCISE_FOLDER_MAP[ex.name]).length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{
                            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.6px', color: 'var(--text-dim)', marginBottom: 4,
                          }}>
                            No form data
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {selectedWorkout.exercises.filter(ex => !EXERCISE_FOLDER_MAP[ex.name]).map(ex => (
                              <div key={ex.name} style={{
                                padding: '5px 10px', borderRadius: 6,
                                border: '1px solid rgba(100,140,200,0.06)',
                                color: 'var(--text-dim)', fontSize: 12,
                                fontFamily: 'Inter',
                              }}>
                                {ex.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {/*Form display */}
        <div className="form-display-panel">
          {!activeFolder ? (
            <div className="form-placeholder">
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>
                  {viewMode === 'workout'
                    ? 'Select a workout then tap an exercise to view its form guide.'
                    : 'Select an exercise to view its form guide.'}
                </div>
              </div>
            </div>
          ) : (
            <ExerciseForm
              key={activeFolder}
              exerciseName={activeExerciseName}
              folder={activeFolder}
              onClose={viewMode === 'workout' ? () => setSelectedWorkoutExercise(null) : null}
            />
          )}
        </div>

      </div>
    </div>
  )
}
