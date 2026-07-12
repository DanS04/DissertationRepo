import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="topnav">
      <div className="topnav-title">Visualising Strength</div>
      <div className="topnav-links">
        <NavLink to="/" end className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
          Activation
        </NavLink>
        <NavLink to="/fatigue" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
          Recovery
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
          Calendar
        </NavLink>
        <NavLink to="/form" className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}>
          Form
        </NavLink>
      </div>
    </nav>
  )
}
