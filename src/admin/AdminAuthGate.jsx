import { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StarEmblem } from '../components/LittleStarLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { extractErrorMessage } from '../services/api.js';

export default function AdminAuthGate() {
  const { needsSetup, login, claimAdmin } = useAuth();

  const [name, setName] = useState('Selina Parveen (Munni)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (needsSetup) {
        await claimAdmin({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <StarEmblem className="w-12 h-12" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">
            {needsSetup ? 'Initialize Little Star Admin' : 'Little Star Admin Portal'}
          </h1>
          <p className="text-sm text-[#52657A]">
            {needsSetup
              ? 'First-time setup: create the authorized administrator account. This setup locks permanently once completed.'
              : 'Authorized administrators only. Sign in with your institutional credentials.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#DCE8F5] p-7 space-y-5 shadow-sm"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {needsSetup && (
            <div>
              <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                Administrator Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
              Administrator Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="admin@littlestar.edu.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#24364B] mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={needsSetup ? 8 : 1}
              autoComplete={needsSetup ? 'new-password' : 'current-password'}
              placeholder={needsSetup ? 'Minimum 8 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2876C8] text-white font-semibold text-sm hover:bg-[#1E62AB] disabled:opacity-50 transition-colors"
          >
            {needsSetup ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>
              {submitting
                ? 'Authenticating...'
                : needsSetup
                  ? 'Create Admin Account & Sign In'
                  : 'Sign In to Dashboard'}
            </span>
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#52657A] hover:text-[#2876C8]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Little Star Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
