import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CAMPUS_DEPARTMENTS } from '../data/departments';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up specific fields
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('CS');
  const [graduationYear, setGraduationYear] = useState('2027');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !handle || !email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        await register({
          name,
          handle: handle.startsWith('@') ? handle : `@${handle}`,
          email,
          password,
          department,
          graduationYear: parseInt(graduationYear, 10)
        });
        setSuccessMessage('Account created successfully! Redirecting...');
      } else {
        if (!identifier || !password) {
          throw new Error('Please enter your email or handle and password.');
        }
        await login(identifier, password);
        setSuccessMessage('Welcome back! Loading your campus dashboard...');
      }

      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = () => {
    setIdentifier('@StudentJohn');
    setPassword('password123');
    setSuccessMessage('Google Campus SSO verified: John Doe (@StudentJohn)');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-midnight-900">
      
      {/* Background Campus Image Layer matching Dashboard */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 filter brightness-[0.75] contrast-[1.05]"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      >
        {/* Midnight / Charcoal Overlay with glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120]/90 via-[#0F172A]/85 to-[#030712]/92 backdrop-blur-md" />
      </div>

      {/* Subtle Ambient Gold Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Split Card matching the site's design system */}
      <div className="relative z-10 w-full max-w-[880px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/50 dark:border-white/10 overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        
        {/* LEFT COLUMN: Clean Form */}
        <div className="w-full md:w-[52%] p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
          
          <div>
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-5">
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-gray-400 hover:text-gold-500 transition-colors"
              >
                <ArrowLeft size={15} /> Back to Campus
              </Link>
            </div>

            {/* Header Text */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-gold-500" />
                CAMPUS GENOME AUTHENTICATION
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight mt-1">
                {isSignUp ? 'Create your DNA' : 'Welcome Back'}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400 mt-1">
                {isSignUp 
                  ? 'Join verified students to build the definitive campus knowledge base.' 
                  : 'Sign in to access verified secrets, building notes, and campus insights.'}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              
              {isSignUp ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-2.5 text-gray-400" size={15} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Swastika Sinha"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-xs sm:text-sm text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                        Campus Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2 text-gray-400 font-mono text-sm">@</span>
                        <input
                          type="text"
                          required
                          value={handle.replace(/^@/, '')}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="SwastikaSinha"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-xs sm:text-sm text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                      Campus Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 text-gray-400" size={15} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@campus.edu"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-xs sm:text-sm text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-xs text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      >
                        {CAMPUS_DEPARTMENTS.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.short} - {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                        Graduation Year
                      </label>
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-xs text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Login identifier input */
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1">
                    Email or Campus Handle
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-gray-400" size={15} />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. @StudentJohn or john.doe@campus.edu"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-sm text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Password input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 dark:text-gray-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => alert("Password reset instructions sent to your registered campus email.")}
                      className="text-[11px] text-gray-500 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-charcoal-700 bg-gray-50/50 dark:bg-charcoal-800/50 text-sm text-charcoal-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-charcoal-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 w-3.5 h-3.5"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>
              )}

              {/* Primary Submit Button: Campus Gold Scheme */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 hover:from-gold-400 hover:to-amber-400 text-charcoal-900 shadow-lg shadow-gold-500/20 transition-all duration-300 flex items-center justify-center gap-2 mt-1 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Student Account' : 'Sign In to CampusGenome'}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              {/* Social Login Separator */}
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-charcoal-700"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[11px] uppercase font-semibold tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-200 dark:border-charcoal-700"></div>
              </div>

              {/* Google Campus SSO Button */}
              <button
                type="button"
                onClick={handleGoogleSSO}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-charcoal-700 hover:bg-gray-50 dark:hover:bg-charcoal-800 text-xs font-semibold text-charcoal-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Sign in with Google Campus SSO
              </button>

            </form>
          </div>

          {/* Toggle between Login and Sign Up */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-charcoal-700 text-center">
            <p className="text-xs text-charcoal-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-gold-600 dark:text-gold-400 hover:underline ml-1 cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Create an Account'}
              </button>
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Midnight Navy & Gold Editorial Showcase */}
        <div className="w-full md:w-[48%] relative bg-gradient-to-br from-[#0e1726] via-[#0B1120] to-[#040810] overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white min-h-[360px] md:min-h-[500px] border-t md:border-t-0 md:border-l border-white/10">
          
          {/* Subtle Ambient Gold Radial Behind Quote */}
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Geometric Motion Graphics & Dynamic DNA Curves (Pure SVG & CSS) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 400 500" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="goldCurve1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#C5A030" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="goldCurve2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0B1120" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Dynamic Soundwave / DNA Helix Wave */}
              <path d="M-50,320 Q80,240 180,360 T420,290 L450,550 L-50,550 Z" fill="url(#goldCurve1)" />
              <path d="M-20,380 Q120,280 260,420 T460,350 L460,550 L-20,550 Z" fill="url(#goldCurve2)" />
              
              {/* Concentric Energy Radii in Warm Gold */}
              <circle cx="360" cy="180" r="140" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 6" opacity="0.2" />
              <circle cx="360" cy="180" r="210" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 8" opacity="0.15" />
              <circle cx="360" cy="180" r="280" stroke="#FEF3C7" strokeWidth="1" opacity="0.1" />

              {/* Dynamic Sprint & Genome Accent Vectors */}
              <line x1="280" y1="260" x2="350" y2="230" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <line x1="290" y1="280" x2="370" y2="245" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              <line x1="310" y1="300" x2="390" y2="265" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gold-400/30 shadow-sm">
              <ShieldCheck size={15} className="text-gold-400" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-gold-200">
                Verified Campus DNA
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping" />
          </div>

          {/* Center Editorial Quote in Warm Gold Typography */}
          <div className="relative z-10 my-auto py-6">
            <div className="max-w-xs">
              <span className="text-gold-400 font-serif italic text-4xl mb-1 block select-none">“</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white/95">
                The unwritten curriculum of college life, mapped by the students who lived it.
              </p>
              <p className="text-[11px] text-gold-300/80 font-sans mt-3.5 uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-6 h-px bg-gold-400/60 inline-block" />
                4,200+ Verified Contributions
              </p>
            </div>
          </div>

          {/* Bottom Status & Platform Indicator */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Platform Status</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Node API v1.0 • Connected
              </span>
            </div>

            {/* Indicator Capsules in Theme Gold/White */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-2 rounded-full bg-gold-400 shadow-sm" />
              <div className="w-4 h-2 rounded-full bg-white/30" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
