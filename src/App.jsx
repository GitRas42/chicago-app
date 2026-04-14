import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { LangProvider } from './i18n'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Login from './features/auth/Login'
import Signup from './features/auth/Signup'
import Lobby from './pages/Lobby'
import GameSession from './pages/GameSession'

function Leaderboard() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <h1 className="text-4xl text-primary" style={{ fontFamily: 'var(--font-display)' }}>
        Topplista
      </h1>
    </main>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route path="/" element={
              <ProtectedRoute><Lobby /></ProtectedRoute>
            } />
            <Route path="/game/:sessionId" element={
              <ProtectedRoute><GameSession /></ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute><Leaderboard /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
