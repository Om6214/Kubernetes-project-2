export default function HomePage() {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

  return (
    <div className="card">
      <h2>Home</h2>
      <p className="small">
        API base URL: <code>{baseUrl}</code>
      </p>
      <p className="small">
        This is a minimal restored frontend scaffold. You can extend pages/components as needed.
      </p>
    </div>
  );
}
