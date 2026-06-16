import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegistering) {
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all registration fields.');
        return;
      }
      setIsSubmitting(true);
      const res = await register(name, email, password, role);
      setIsSubmitting(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message || 'Registration failed. Try a different email address.');
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
      setIsSubmitting(true);
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setIsRegistering(false);
    setEmail(roleEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrorMsg('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('Staff');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 grid-bg relative overflow-y-auto">
      {/* Background radial accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 px-4 py-2 rounded-2xl shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AeroDash</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {isRegistering ? 'Create your dashboard account' : 'Sign in to your dashboard'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegistering ? 'Register role permission settings directly' : 'Multi-Role Permission-Based Access Center'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-8 px-4 border border-slate-200/50 dark:border-slate-800/50 shadow-glass-light dark:shadow-glass-dark rounded-3xl sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 animate-pulse-slow">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Field (Register Mode Only) */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Field (Register Mode Only) */}
            {isRegistering && (
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Account Role Permission Level
                </label>
                <div className="mt-1.5">
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegistering ? 'Register Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Form Toggle Switch */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need a new account? Sign Up'}
            </button>
          </div>

          {/* Quick Login Assist Panel (Only in Login Mode) */}
          {!isRegistering && (
            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-4">
                Demo Quick-Fill Accounts
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('superadmin@dashboard.com')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-violet-100 hover:border-violet-300 dark:border-violet-950/40 dark:hover:border-violet-800/60 bg-violet-50/30 dark:bg-violet-950/10 text-violet-700 dark:text-violet-400 text-xs font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all"
                >
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager@dashboard.com')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-100 hover:border-blue-300 dark:border-blue-950/40 dark:hover:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                  <span>Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('staff@dashboard.com')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-slate-800/40 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                >
                  <span>Staff</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3.5">
                Default password for all roles: <code className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">password123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
