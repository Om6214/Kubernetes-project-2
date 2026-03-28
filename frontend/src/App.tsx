import { Link, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EventsPage from './pages/EventsPage';
import BookingsPage from './pages/BookingsPage';

function Nav() {
  const { token, logout } = useAuth();

  return (
    <div className="header">
      <div className="row">
        <strong>{import.meta.env.VITE_APP_NAME ?? 'Event Management System'}</strong>
        <span className="small">v{import.meta.env.VITE_APP_VERSION ?? '1.0.0'}</span>
      </div>

      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/bookings">Bookings</Link>
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </nav>
    </div>
  );
}

function AppShell() {
  return (
    <div className="container">
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
