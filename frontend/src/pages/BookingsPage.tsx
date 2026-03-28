import { useEffect, useState } from 'react';

import { listBookings } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types/booking';

export default function BookingsPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setBookings([]);
      return;
    }

    (async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await listBookings(token);
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="card">
      <h2>Bookings</h2>
      {!token ? <p className="small">Login to view your bookings.</p> : null}
      {busy ? <p className="small">Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {token && !busy && !error && bookings.length === 0 ? (
        <p className="small">No bookings found.</p>
      ) : null}

      {bookings.map((b) => (
        <div key={b.id} className="card">
          <strong>Booking</strong>
          <div className="small">Event: {b.eventId}</div>
          {b.status ? <div className="small">Status: {b.status}</div> : null}
        </div>
      ))}
    </div>
  );
}
