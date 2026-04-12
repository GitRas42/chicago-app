import { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './features/auth/AuthContext';
import { useStorage } from './hooks/useStorage';
import { KEYS } from './storage';
import Menu from './pages/Menu';
import Setup from './pages/Setup';
import ActiveGame from './pages/ActiveGame';
import History from './pages/History';
import GameDetail from './pages/GameDetail';
import Leaderboard from './pages/Leaderboard';
import Rules from './pages/Rules';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Profile from './pages/Profile';

const AppStateContext = createContext();

export function useAppState() {
  return useContext(AppStateContext);
}

function AppStateProvider({ children }) {
  const [knownPlayers, setKnownPlayers] = useStorage(KEYS.players, []);
  const [games, setGames] = useStorage(KEYS.games, []);
  const [active, setActive] = useStorage(KEYS.active, null);

  return (
    <AppStateContext.Provider value={{ knownPlayers, setKnownPlayers, games, setGames, active, setActive }}>
      {children}
    </AppStateContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppStateProvider>
            <ToastProvider>
              <div style={{ background: 'var(--bg)', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
                <Routes>
                  <Route path="/" element={<Menu />} />
                  <Route path="/setup" element={<Setup />} />
                  <Route path="/game" element={<ActiveGame />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/history/:id" element={<GameDetail />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
            </ToastProvider>
          </AppStateProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
