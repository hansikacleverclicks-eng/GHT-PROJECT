import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logoremove.png';

const AdminPanel = () => {
  const { authenticated, email: authedEmail, role, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      setIsError(true);
      setMessage('Please enter email and password.');
      return;
    }
    setLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch('/backend/api/auth/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        navigate('/admin/dashboard');
      } else {
        setIsError(true);
        setMessage(data.error || 'Invalid email or password.');
      }
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : 'Login error. Please try again.');
    }
    setLoading(false);
  };

  const logout = async () => {
    await fetch('/backend/api/auth/logout.php');
    refresh();
  };

  // Already logged in screen
  if (authenticated) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
          <img src={logo} alt="GH&T Logo" className="h-16 w-16 mx-auto mb-4 object-contain" />
          <h2 className="text-xl font-bold text-[#101c34] mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-1">{authedEmail}</p>
          <span className="inline-block bg-[#101c34] text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-6">{role}</span>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full bg-[#101c34] text-white py-3 rounded-lg font-medium hover:bg-[#1a2d52] transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={logout}
              className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101c34] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <img src={logo} alt="GH&T Logo" className="h-14 w-14 object-contain" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">Global Hotels & Tourism</h1>
          <p className="text-[#8a9bbf] text-sm mt-1">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-[#101c34] text-xl font-bold mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the dashboard</p>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] focus:border-transparent transition"
                placeholder="admin@globalhotels.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] focus:border-transparent transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-[#101c34] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1a2d52] disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </div>

        <p className="text-center text-[#4a5568] text-xs mt-6">
          © {new Date().getFullYear()} Global Hotels & Tourism. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
