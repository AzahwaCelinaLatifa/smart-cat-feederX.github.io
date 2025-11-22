import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const [isSignUp, setIsSignUp] = useState(false);
const [savedEmails, setSavedEmails] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const suggestionsRef = useRef<HTMLDivElement | null>(null);
const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  // Prevent background scrolling while the Login page is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // add a body class so we can hide page chrome (nav, shadows) specifically on Login
    document.body.classList.add("login-active");
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("login-active");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Please provide both email and password.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      if (isSignUp) {
        const API_BASE = (import.meta as any).env.VITE_API_BASE || "";
        let autoConfirmed = false;
        try {
          const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
            if (signInErr) throw signInErr;
            autoConfirmed = true;
          }
        } catch {}

        if (!autoConfirmed) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (!data.session) {
            navigate("/verify-email");
            return;
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // on successful auth, persist this email to localStorage for future suggestions
      try {
        const key = "saved_emails";
        const list = JSON.parse(localStorage.getItem(key) || "[]") as string[];
        const normalized = email.trim().toLowerCase();
        const deduped = [normalized, ...list.filter((x) => x !== normalized)].slice(0, 5);
        localStorage.setItem(key, JSON.stringify(deduped));
        setSavedEmails(deduped);
      } catch (e) {}
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("saved_emails") || "[]") as string[];
      setSavedEmails(Array.isArray(list) ? list : []);
    } catch (e) {
      setSavedEmails([]);
    }
  }, []);

  // click outside to close suggestions
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!suggestionsRef.current) return;
      if (!suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="login-page-root min-h-screen w-full flex flex-col items-center justify-center" style={{
      background: 'linear-gradient(180deg, #F5E5E1 0%, #427A76 51.39%, #174143 78.39%)'
    }}>
      <div className="w-full px-4 flex flex-col items-center justify-center">
        {/* Corner logo (top-left) - rendered here but positioned via CSS for login-only */}
        <div className="login-corner-logo" aria-hidden>
          <img
            src="/assets/Black White Bold Modern Studio Logo 8.svg"
            alt="Pawsitive Feed Logo"
            className="object-contain"
            style={{ width: '100%', height: 'auto' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Container di atas card: gambar kucing (diletakkan di atas card, centered) */}
        <div className="flex flex-col items-center justify-center" style={{ gap: '12px', marginBottom: '-60px', zIndex: 10, position: 'relative' }}>
          <img
            src="/assets/Recorrido Virtual Universidad de La Sabana Utiliza las flechas de tu teclado o tu mouse para desplazarte por las diferentes locaciones. Click aquí para comenzar (4) 1 (1).svg"
            alt="Cute 3D Cat"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain"
          />
        </div>
        <div className="bg-white shadow-xl" style={{
          width: 'min(390px, 90vw)',
          borderRadius: '30px',
          background: '#FFF'
        }}>
          {/* Toggle */}
          <div className="px-8 pt-6 pb-2" style={{ position: 'relative', zIndex: 20 }}>
            <div className="flex items-center gap-4 justify-center">
              <button
                type="button"
                className="px-8 py-3 font-semibold transition-all cursor-pointer shadow-md"
                onClick={() => setIsSignUp(false)}
                style={{ 
                  pointerEvents: 'auto',
                  borderRadius: '30px',
                  background: !isSignUp ? '#174143' : '#F5E5E1',
                  color: !isSignUp ? '#FFFFFF' : '#174143',
                  border: 'none',
                  fontSize: '14px',
                  WebkitTextFillColor: !isSignUp ? '#FFFFFF' : '#174143'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="px-8 py-3 font-semibold transition-all cursor-pointer shadow-md"
                onClick={() => setIsSignUp(true)}
                style={{ 
                  pointerEvents: 'auto',
                  borderRadius: '30px',
                  background: isSignUp ? '#174143' : '#F5E5E1',
                  color: isSignUp ? '#FFFFFF' : '#174143',
                  border: 'none',
                  fontSize: '14px',
                  WebkitTextFillColor: isSignUp ? '#FFFFFF' : '#174143'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
          {/* images moved outside the card */}
          {/* Heading */}
          <div className="px-8 pt-3 pb-4">
            <h1 className="text-6xl font-bold" style={{
              color: '#174143',
              textAlign: 'left',
              fontFamily: 'Poppins',
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.84px'
            }}>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
          </div>
          {/* Form */}
          <div className="px-8 pb-6">
            {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative" ref={suggestionsRef}>
                <label className="block mb-2" style={{ color: '#6C6C6C', fontFamily: 'Montserrat', fontSize: '14px', fontStyle: 'normal', fontWeight: 300, lineHeight: 'normal', letterSpacing: '0.42px', width: '295px' }}>Email</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} required className="px-6 py-3 focus:ring-0 focus:border-gray-300 transition-colors text-base" style={{ width: '291px', height: '36px', borderRadius: '20px', border: '0.5px solid #797979', outline: 'none', backgroundColor: '#ffffff' }} />
                {showSuggestions && savedEmails.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    {savedEmails.filter(s => s.includes(email.trim().toLowerCase())).map((s) => (
                      <button key={s} type="button" className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm" onMouseDown={(ev) => { ev.preventDefault(); setEmail(s); setShowSuggestions(false); }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#6C6C6C', fontFamily: 'Montserrat', fontSize: '14px', fontStyle: 'normal', fontWeight: 300, lineHeight: 'normal', letterSpacing: '0.42px', width: '295px' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="px-6 py-3 focus:ring-0 focus:border-gray-300 transition-colors text-base" style={{ width: '291px', height: '36px', borderRadius: '20px', border: '0.5px solid #797979', outline: 'none', backgroundColor: '#ffffff' }} />
              </div>
              <div className="text-right pt-1 pb-1">
                {!isSignUp && (
                  <Link href="/forgot-password" className="hover:underline" style={{ color: '#815247', fontFamily: 'Montserrat', fontSize: '14px', fontStyle: 'normal', fontWeight: 400, lineHeight: '25px', letterSpacing: '0.42px', width: '295px', display: 'inline-block' }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="pt-1 flex justify-start">
                <button
                  type="submit"
                  disabled={loading}
                  className="hover:opacity-90 transition"
                  style={{
                    borderRadius: '30px',
                    background: '#174143',
                    width: '291px',
                    height: '44px',
                    flexShrink: 0,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    color: '#FFFFFF',
                    WebkitTextFillColor: '#FFFFFF',
                    fontFamily: 'Montserrat',
                    fontSize: '16px',
                    fontWeight: 600,
                    letterSpacing: '0.48px'
                  }}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
