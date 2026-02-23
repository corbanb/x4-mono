import { useState, type FormEvent } from 'react';
import { createAuthClient } from 'better-auth/react';

const API_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL) ||
  'http://localhost:3002';

const authClient = createAuthClient({ baseURL: API_URL });

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = await authClient.signUp.email({
          email,
          password,
          name: email.split('@')[0],
        });
        if (result.error) {
          setError(result.error.message ?? 'Signup failed');
          setLoading(false);
          return;
        }
        // After signup, sign in
      }

      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? 'Invalid credentials');
      } else if (result.data?.token) {
        await window.electronAuth.setToken(result.data.token);
        onLoginSuccess();
      } else {
        setError('No token received');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{mode === 'login' ? 'Log In' : 'Create Account'}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={8}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.link}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: 400,
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: 12,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
  },
  button: {
    padding: 12,
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    margin: 0,
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 16,
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
  },
};
