export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
};

function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in (data as any) && (data as any).message) ||
      `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }

  return data as T;
}
