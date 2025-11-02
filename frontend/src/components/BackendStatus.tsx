// Example usage of apiFetch utility
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../pages/Official/Reports/api/api';

export default function BackendStatus() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/`, { credentials: 'include' })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) throw new Error(body || res.statusText);
        try {
          const data = JSON.parse(body);
          setStatus(typeof data === 'string' ? data : JSON.stringify(data));
        } catch {
          setStatus(body);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Backend Status</h3>
      {status && <div style={{ color: 'green' }}>{status}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
