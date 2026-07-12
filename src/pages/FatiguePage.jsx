import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import BodyModel3D from '../components/BodyModel3D'
import Legend from '../components/Legend'
import { useWorkouts } from '../context/WorkoutContext'
import { calculateFatigue, buildFatigueTimeSeries, hoursToRecovery } from '../utils/fatigueModel'
import { MUSCLE_CONFIG, MUSCLE_GROUPS } from '../data/muscleConfig'
import { fatigueColour } from '../utils/colourUtils'

const GROUP_COLOURS = {
  Chest: '#8899bb', Back: '#8899bb', Shoulders: '#8899bb',
  Arms: '#8899bb', Legs: '#8899bb', Core: '#8899bb',
}

function RecoveryBar({ value }) {
  const colour = fatigueColour(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: colour, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: colour, minWidth: 36 }}>{value}%</span>
    </div>
  )
}

export default function FatiguePage() {
  const { workouts, badSleepDates } = useWorkouts()
  const [selectedMuscles, setSelectedMuscles] = useState(['Biceps', 'QuadsVasti', 'Lats', 'Glutes'])

  const fatigueValues = useMemo(() => calculateFatigue(workouts, badSleepDates), [workouts, badSleepDates])

  const overallFatigue = useMemo(() => {
    const vals = Object.values(fatigueValues)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }, [fatigueValues])

  // All muscles grouped by body part for the display
  const groupedRecovery = useMemo(() => {
    const groups = {}
    Object.entries(MUSCLE_CONFIG).forEach(([name, cfg]) => {
      if (!groups[cfg.group]) groups[cfg.group] = []
      groups[cfg.group].push({
        name, displayName: cfg.displayName,
        fatigue: fatigueValues[name] ?? 0,
        hoursToRecover: hoursToRecovery(workouts, name, badSleepDates),
      })
    })
    // Sort each groups muscles by fatigue descending
    Object.values(groups).forEach(arr => arr.sort((a, b) => b.fatigue - a.fatigue))
    return groups
  }, [fatigueValues, workouts, badSleepDates])

  const timeSeriesData = useMemo(() => {
    if (selectedMuscles.length === 0) return []
    const series = selectedMuscles.map(m => buildFatigueTimeSeries(workouts, m, badSleepDates))
    return (series[0] ?? []).map((point, i) => {
      const entry = { date: point.date }
      selectedMuscles.forEach((m, mi) => { entry[m] = series[mi]?.[i]?.fatigue ?? 0 })
      return entry
    })
  }, [workouts, selectedMuscles, badSleepDates])

  const toggleMuscle = (name) =>
    setSelectedMuscles(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name])

  return (
    <div className="page-layout">

      {/*3D model + fatigue summary + recovery*/}
      <div className="top-section">

        {/* 3D model coloured by fatigue */}
        <div className="model-panel">
          <div className="panel-header">
            <h2 className="panel-title">Fatigue Map</h2>
            <p className="panel-subtitle">Residual fatigue based on your workout history</p>
          </div>
          <div className="model-container">
            <BodyModel3D muscleValues={fatigueValues} mode="fatigue" />
          </div>
          <Legend mode="fatigue" />
          {workouts.length === 0 && (
            <div className="model-empty-notice">Log workouts in the Calendar to see fatigue buildup</div>
          )}
        </div>

        {/* Summary stats + grouped recovery status */}
        <div className="controls-panel">

          {/* Summary stats */}
          <div className="stats-row" style={{ flexShrink: 0 }}>
            {[
              { val: workouts.length, label: 'Sessions Logged', colour: null },
              { val: `${overallFatigue}%`, label: 'Avg. Fatigue', colour: fatigueColour(overallFatigue) },
              { val: Object.values(fatigueValues).filter(v => v < 20).length, label: 'Ready to Train', colour: '#10b981' },
              { val: Object.values(fatigueValues).filter(v => v >= 60).length, label: 'Need Rest', colour: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value" style={s.colour ? { color: s.colour } : {}}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recovery status grouped by body part*/}
          <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: 6 }}>
              <span className="card-label">Recovery Status</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {MUSCLE_GROUPS.filter(g => g !== 'All').map(group => {
                const muscles = groupedRecovery[group]
                if (!muscles?.length) return null
                return (
                  <div key={group} style={{ marginBottom: 10 }}>
                    {/* Group headers */}
                    <div style={{
                      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px',
                      color: GROUP_COLOURS[group] ?? '#8899bb',
                      borderBottom: `1px solid ${GROUP_COLOURS[group] ?? '#8899bb'}22`,
                      paddingBottom: 3, marginBottom: 4,
                    }}>
                      {group}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
                      {muscles.map(row => (
                        <div key={row.name} style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '2px 0',
                          borderBottom: '1px solid rgba(100,140,200,0.05)',
                        }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                            background: fatigueColour(row.fatigue),
                          }} />
                          <span style={{
                            fontSize: 11, color: '#c4cfe0', flex: 1,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {row.displayName}
                          </span>
                          <span style={{
                            fontFamily: 'Inter', fontSize: 10,
                            color: fatigueColour(row.fatigue), flexShrink: 0, minWidth: 28, textAlign: 'right',
                          }}>
                            {row.fatigue}%
                          </span>
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

      {/* Graphs*/}
      <div className="graphs-section">

        {/* Fatigue timeline chart */}
        <div className="card card--chart">
          <div className="card-header">
            <span className="card-label">Fatigue Timeline: 14 days</span>
          </div>

          <div className="muscle-selector-row">
            {Object.keys(MUSCLE_CONFIG).map(name => (
              <button key={name}
                className={`muscle-chip ${selectedMuscles.includes(name) ? 'muscle-chip--active' : ''}`}
                onClick={() => toggleMuscle(name)}
                style={selectedMuscles.includes(name) ? {
                  borderColor: GROUP_COLOURS[MUSCLE_CONFIG[name].group] ?? '#00e5d4',
                  color: GROUP_COLOURS[MUSCLE_CONFIG[name].group] ?? '#00e5d4',
                } : {}}
              >
                {MUSCLE_CONFIG[name].displayName.split(' ')[0]}
              </button>
            ))}
          </div>

          {workouts.length > 0 && timeSeriesData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 4, right: 32, left: 0, bottom: 4 }}>
                  <XAxis dataKey="date"
                    tick={{ fill: '#8899bb', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(136,153,187,0.15)' }} tickLine={false}
                    interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]}
                    tick={{ fill: '#8899bb', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <ReferenceLine y={20} stroke="rgba(16,185,129,0.4)" strokeDasharray="4 2"
                    label={{ value: 'Ready', position: 'insideRight', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={60} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 2"
                    label={{ value: 'Overreached', position: 'insideRight', fill: '#ef4444', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(8,14,26,0.95)', border: '1px solid rgba(0,229,212,0.2)', borderRadius: 8, fontFamily: 'DM Sans' }}
                    labelStyle={{ color: '#8899bb', fontSize: 11 }}
                    formatter={(val, name) => [`${val}%`, MUSCLE_CONFIG[name]?.displayName ?? name]} />
                  {selectedMuscles.map(m => (
                    <Line key={m} type="monotone" dataKey={m}
                      stroke={GROUP_COLOURS[MUSCLE_CONFIG[m]?.group] ?? '#00e5d4'}
                      strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              {workouts.length === 0
                ? 'No workouts logged yet. Add sessions in the Calendar tab.'
                : 'Select muscles above to view their fatigue timelines.'}
            </div>
          )}
        </div>

        {/* Explanation of fatigue calculation note on bottom of page */}
        <div className="card" style={{ borderColor: 'rgba(0,229,212,0.12)' }}>
          <div className="card-label" style={{ marginBottom: 8 }}>Fatigue Model Basis</div>
          <p style={{ fontSize: 12, color: '#7a8fb5', lineHeight: 1.7 }}>
            Recovery modelled as exponential decay F(t) = F₀ · e<sup>−t·ln5/τ</sup>,
            where τ is the time at which fatigue reaches exactly 20% of peak (ready-to-train threshold).
            Recovery times (to 20%): large compound muscles (Glutes, Quads, Hamstrings, Lats) <strong style={{ color: '#c4cfe0' }}>72h</strong>,
            medium muscles (Chest, Traps, Erectors) <strong style={{ color: '#c4cfe0' }}>60h</strong>,
            small isolation muscles (Biceps, Triceps, Deltoids) <strong style={{ color: '#c4cfe0' }}>48h</strong>,
            core &amp; forearms <strong style={{ color: '#c4cfe0' }}>36h</strong>.
            Based on Peake et al. (2017) and Kraemer &amp; Ratamess (2004).
            The 20% threshold for full readiness follows ACSM guidelines.
          </p>
        </div>

      </div>
    </div>
  )
}
