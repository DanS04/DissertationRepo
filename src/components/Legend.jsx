import { activationColour, fatigueColour } from '../utils/colourUtils'

const STOPS = [0, 20, 40, 60, 80, 100]

export default function Legend({ mode }) {
  const colourFn = mode === 'fatigue' ? fatigueColour : activationColour
  const label = mode === 'fatigue' ? '% Fatigue' : '% MVC Activation'
  const lowLabel = mode === 'fatigue' ? 'Recovered' : 'Inactive'
  const highLabel = mode === 'fatigue' ? 'Fatigued' : 'Max Activation'

  const gradientColours = STOPS.map(s => colourFn(s)).join(', ')

  return (
    <div className="legend">
      <div className="legend-title">{label}</div>
      <div className="legend-gradient" style={{ background: `linear-gradient(to right, ${gradientColours})` }} />
      <div className="legend-labels">
        <span>{lowLabel}</span>
        <span>50%</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
