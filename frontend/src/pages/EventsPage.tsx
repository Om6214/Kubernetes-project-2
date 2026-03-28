import { useEffect, useState } from 'react';

import { listEvents } from '../api/events';
import type { Event } from '../types/event';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await listEvents();
        if (!cancelled) setEvents(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card">
      <h2>Events</h2>
      {busy ? <p className="small">Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!busy && !error && events.length === 0 ? (
        <p className="small">No events found.</p>
      ) : null}

      {events.map((ev) => (
        <div key={ev.id} className="card">
          <strong>{ev.title}</strong>
          <div className="small">{ev.description ?? ''}</div>
          {ev.date ? <div className="small">{new Date(ev.date).toLocaleString()}</div> : null}
        </div>
      ))}
    </div>
  );
}
