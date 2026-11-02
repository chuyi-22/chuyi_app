import { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Today from './pages/Today'
import Plans from './pages/Plans'
import Focus from './pages/Focus'
import Schedule from './pages/Schedule'
import Habits from './pages/Habits'
import Review from './pages/Review'
import { IconBook, IconGrid, IconHome, IconLoop, IconSprout, IconToday } from './components/Icons'

const NAV = [
  { to: '/', label: '总览', icon: IconHome, end: true },
  { to: '/today', label: '今日', icon: IconToday },
  { to: '/plans', label: '计划', icon: IconSprout },
  { to: '/schedule', label: '课表', icon: IconGrid },
  { to: '/habits', label: '习惯', icon: IconLoop },
  { to: '/review', label: '复盘', icon: IconBook },
]

export default function App() {
  const { pathname } = useLocation()
  const isFocus = pathname.startsWith('/focus')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <>
      <div className={`shell${isFocus ? ' shell-focus' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<Today />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/focus/:id" element={<Focus />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/review" element={<Review />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      {!isFocus && <nav className="nav">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>}
    </>
  )
}
