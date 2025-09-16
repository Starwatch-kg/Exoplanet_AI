import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/demo';
    } catch (err) {
      setError('Неверная почта или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-xl bg-white/5 border border-white/10">
        <h1 className="text-2xl font-bold">Вход</h1>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <input
          className="w-full px-4 py-2 rounded-md bg-black/40 border border-white/10"
          placeholder="email@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full px-4 py-2 rounded-md bg-black/40 border border-white/10"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full px-4 py-2 rounded-md bg-cyan-500 text-black font-medium">Войти</button>
      </form>
    </div>
  );
};

export default Login;


