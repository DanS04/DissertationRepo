import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import BodyModel3D from '../components/BodyModel3D'
import Legend from '../components/Legend'
import { EXERCISE_DATA, EXERCISE_NAMES, EXERCISE_CATEGORIES } from '../data/exerciseData'
import { MUSCLE_CONFIG, MUSCLE_GROUPS } from '../data/muscleConfig'
import { activationColour } from '../utils/colourUtils'
import { useWorkouts } from '../context/WorkoutContext'

const GROUP_COLOURS = {
  Chest: '#8899bb', Back: '#8899bb', Shoulders: '#8899bb',
  Arms: '#8899bb', Legs: '#8899bb', Core: '#8899bb',
}

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="tooltip-name">{d.displayName}</div>
      <div className="tooltip-value" style={{ color: activationColour(d.value) }}>{d.value}% MVC</div>
      <div className="tooltip-sub">{MUSCLE_CONFIG[d.name]?.group}</div>
    </div>
  )
}

export default function ActivationPage() {
  const { workouts } = useWorkouts()
  const [viewMode, setViewMode]                 = useState('exercise') 
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(null)
  const [selectedGroup, setSelectedGroup]       = useState('All')
  const [categoryFilter, setCategoryFilter]     = useState('All')
  const [hoveredMuscle, setHoveredMuscle]       = useState(null)

  const recentWorkouts = useMemo(() =>
    workouts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
  [workouts])

  // Auto selects the most recent workout when you switch to recent workout mode
  const handleViewMode = (mode) => {
    setViewMode(mode)
    setSelectedGroup('All')
    if (mode === 'workout' && !selectedWorkoutDate && recentWorkouts.length > 0) {
      setSelectedWorkoutDate(recentWorkouts[0].date)
    }
  }

  const selectedWorkout = useMemo(() =>
    workouts.find(w => w.date === selectedWorkoutDate) ?? null,
  [workouts, selectedWorkoutDate])

  const exerciseData = EXERCISE_DATA[selectedExercise]

  // Activation for a workout
  const workoutMuscleValues = useMemo(() => {
    const vals = {}
    for (const name of Object.keys(MUSCLE_CONFIG)) vals[name] = 0
    if (!selectedWorkout) return vals
    for (const ex of selectedWorkout.exercises) {
      const muscles = EXERCISE_DATA[ex.name]?.muscles ?? {}
      for (const [name, value] of Object.entries(muscles)) {
        if ((vals[name] ?? 0) < value) vals[name] = value
      }
    }
    return vals
  }, [selectedWorkout])

  const muscleValues = useMemo(() => {
    if (viewMode === 'workout') return workoutMuscleValues
    const vals = {}
    for (const name of Object.keys(MUSCLE_CONFIG)) vals[name] = exerciseData?.muscles[name] ?? 0
    return vals
  }, [viewMode, workoutMuscleValues, exerciseData])

  const chartData = useMemo(() => {
    const source = viewMode === 'workout' ? workoutMuscleValues : (exerciseData?.muscles ?? {})
    return Object.entries(source)
      .filter(([, v]) => v > 0)
      .filter(([name]) => selectedGroup === 'All' || MUSCLE_CONFIG[name]?.group === selectedGroup)
      .map(([name, value]) => ({ name, displayName: MUSCLE_CONFIG[name]?.displayName ?? name, value }))
      .sort((a, b) => b.value - a.value)
  }, [viewMode, workoutMuscleValues, exerciseData, selectedGroup])

  const filteredExercises = useMemo(() =>
    categoryFilter === 'All' ? EXERCISE_NAMES
      : EXERCISE_NAMES.filter(n => EXERCISE_DATA[n].category === categoryFilter),
  [categoryFilter])

  const activeGroups = useMemo(() => {
    const source = viewMode === 'workout' ? workoutMuscleValues : (exerciseData?.muscles ?? {})
    const groups = new Set(Object.keys(source).filter(n => source[n] > 0).map(n => MUSCLE_CONFIG[n]?.group).filter(Boolean))
    return MUSCLE_GROUPS.filter(g => g === 'All' || groups.has(g))
  }, [viewMode, workoutMuscleValues, exerciseData])

  const groupedActivation = useMemo(() => {
    const groups = {}
    Object.entries(MUSCLE_CONFIG).forEach(([name, cfg]) => {
      if (!groups[cfg.group]) groups[cfg.group] = []
      groups[cfg.group].push({ name, cfg, val: muscleValues[name] ?? 0 })
    })
    return groups
  }, [muscleValues])

  const chartLabel = viewMode === 'workout'
    ? selectedWorkout ? `Workout: ${format(new Date(selectedWorkout.date + 'T00:00'), 'd MMM yyyy')}` : 'No workout selected'
    : (selectedExercise ?? 'No exercise selected')

  return (
    <div className="page-layout">

      {/* 3D model + exercise controls */}
      <div className="top-section">

        {/* 3D model */}
        <div className="model-panel">
          <div className="panel-header">
            <h2 className="panel-title">Muscle Activation</h2>
            <p className="panel-subtitle">Hover any muscle to inspect its EMG value</p>
          </div>
          <div className="model-container">
            <BodyModel3D muscleValues={muscleValues} mode="activation" onMuscleHover={setHoveredMuscle} />
          </div>
          <Legend mode="activation" />
        </div>

        {/* Exercise controls + muscle reference */}
        <div className="controls-panel">

          {/* Exercise / Workout selector - fixed height */}
          <div className="card" style={{ flexShrink: 0 }}>
            <div className="card-header">
              <span className="card-label">Select Activation Source</span>
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
                    <button key={cat} className={`tab ${categoryFilter === cat ? 'tab--active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}>{cat}</button>
                  ))}
                </div>
                <select className="select" value={selectedExercise ?? ''} onChange={e => setSelectedExercise(e.target.value || null)}>
                  <option value="">Select an exercise</option>
                  {filteredExercises.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                {exerciseData && (
                  <div className="exercise-meta">
                    <span className="meta-item">Primary: <strong>{exerciseData.primaryGroup}</strong></span>
                    <span className="meta-item">Muscles activated: <strong>{Object.keys(exerciseData.muscles).length}</strong></span>
                  </div>
                )}
              </>
            ) : (
              recentWorkouts.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 12, padding: '10px 0' }}>
                  No workouts logged yet. Add sessions in the Calendar tab.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
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
              )
            )}
          </div>

          {/* Hovered muscle info */}
          {hoveredMuscle && MUSCLE_CONFIG[hoveredMuscle] && (
            <div className="card card--highlight" style={{ flexShrink: 0 }}>
              <div className="hovered-muscle-name">{MUSCLE_CONFIG[hoveredMuscle].displayName}</div>
              <div className="hovered-muscle-group">{MUSCLE_CONFIG[hoveredMuscle].group}</div>
              <div className="hovered-muscle-desc">{MUSCLE_CONFIG[hoveredMuscle].description}</div>
              {muscleValues[hoveredMuscle] > 0 && (
                <div className="hovered-muscle-value">
                  <span style={{ color: activationColour(muscleValues[hoveredMuscle]) }}>
                    {muscleValues[hoveredMuscle]}%
                  </span>{' '}MVC in {viewMode === 'workout' ? 'this session' : (selectedExercise ?? 'this exercise')}
                </div>
              )}
            </div>
          )}

          {/* Full muscle reference*/}
          <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: 8 }}>
              <span className="card-label">Muscle Reference: {chartLabel}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {MUSCLE_GROUPS.filter(g => g !== 'All').map(group => {
                const muscles = groupedActivation[group]
                if (!muscles?.length) return null
                return (
                  <div key={group} style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px',
                      color: GROUP_COLOURS[group] ?? '#8899bb',
                      borderBottom: `1px solid ${GROUP_COLOURS[group] ?? '#8899bb'}22`,
                      paddingBottom: 3, marginBottom: 4,
                    }}>
                      {group}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
                      {muscles.map(({ name, cfg, val }) => (
                        <div key={name} style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '2px 0',
                          borderBottom: '1px solid rgba(100,140,200,0.05)',
                        }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                            background: val > 0 ? activationColour(val) : '#3a4a60',
                          }} />
                          <span style={{
                            fontSize: 11, color: val > 0 ? '#c4cfe0' : '#4a5a7a',
                            flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {cfg.displayName}
                          </span>
                          {val > 0 && (
                            <span style={{
                              fontFamily: 'JetBrains Mono', fontSize: 10,
                              color: activationColour(val), flexShrink: 0, minWidth: 28, textAlign: 'right',
                            }}>
                              {val}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Graphs */}
      <div className="graphs-section">

        {/* Activation bar chart */}
        <div className="card card--chart">
          <div className="card-header">
            <span className="card-label">Activation by Muscle: {chartLabel}</span>
            <div className="group-tabs">
              {activeGroups.map(g => (
                <button key={g} className={`group-tab ${selectedGroup === g ? 'group-tab--active' : ''}`}
                  onClick={() => setSelectedGroup(g)}>{g}</button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                  <XAxis type="number" domain={[0, 100]}
                    tick={{ fill: '#8899bb', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `${v}%`}
                    axisLine={{ stroke: 'rgba(136,153,187,0.15)' }} tickLine={false} />
                  <YAxis type="category" dataKey="displayName" width={170}
                    tick={{ fill: '#c4cfe0', fontSize: 11, fontFamily: 'DM Sans' }}
                    axisLine={false} tickLine={false} />
                  <ReferenceLine x={50} stroke="rgba(136,153,187,0.25)" strokeDasharray="4 2" />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={22}>
                    {chartData.map(entry => <Cell key={entry.name} fill={activationColour(entry.value)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">No muscles match this filter</div>
          )}
        </div>

      </div>
    </div>
  )
}
