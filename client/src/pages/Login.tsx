import { useState, useEffect, useRef } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);

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
    // basic client-side validation
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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
    <div className="fixed inset-0 flex items-center justify-center p-4 login-gradient">
      <div className="flex flex-col items-center gap-4">
        {/* Animated cat that peeks above the login card */}
        <div className="pointer-events-none z-50">
          <svg
            className="login-cat"
            viewBox="0 0 140 120"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-hidden="true"
          >
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* subtle ground shadow so the head feels attached */}
            <ellipse cx="70" cy="110" rx="40" ry="8" fill="#000" opacity="0.06" />

            {/* the head group that will peek up/down (slightly tilted like reference) */}
            <g className="cat-head" filter="url(#shadow)" transform="translate(0,24) rotate(-6 70 56)">
              {/* left ear with pink inner */}
              <path className="cat-ear cat-ear--left" d="M28 36 L46 4 L62 36 Z" fill="#0b0b0b" />
              <path className="cat-ear-inner cat-ear-inner--left" d="M40 26 L46 12 L52 26 Z" fill="#ffb6b6" opacity="0.95" />

              {/* right ear with pink inner */}
              <path className="cat-ear cat-ear--right" d="M112 36 L94 4 L78 36 Z" fill="#0b0b0b" />
              <path className="cat-ear-inner cat-ear-inner--right" d="M100 26 L94 12 L88 26 Z" fill="#ffb6b6" opacity="0.95" />

              {/* rounded face */}
              <ellipse className="cat-face" cx="70" cy="58" rx="46" ry="44" fill="#0b0b0b" />

              {/* BIG round eyes like the reference (white outer, brown iris, black pupil with tiny highlight) */}
              <g className="cat-eye-group" transform="translate(0,0)">
                <g className="cat-eye cat-eye--left" transform="translate(-18,0)">
                  <circle className="eye-white" cx="70" cy="56" r="16" fill="#ffffff" />
                  <circle className="eye-iris" cx="70" cy="56" r="10" fill="#462f2f" />
                  <circle className="eye-pupil" cx="72" cy="58" r="5" fill="#000" />
                  <circle className="eye-glint" cx="76" cy="52" r="2" fill="#fff" opacity="0.95" />
                </g>
                <g className="cat-eye cat-eye--right" transform="translate(18,0)">
                  <circle className="eye-white" cx="70" cy="56" r="16" fill="#ffffff" />
                  <circle className="eye-iris" cx="70" cy="56" r="10" fill="#462f2f" />
                  <circle className="eye-pupil" cx="72" cy="58" r="5" fill="#000" />
                  <circle className="eye-glint" cx="76" cy="52" r="2" fill="#fff" opacity="0.95" />
                </g>
              </g>

              {/* tiny pink triangular nose */}
              <path className="cat-nose" d="M70 74 l-4 6 l8 0 z" fill="#ff8b8b" />

              {/* subtle whiskers */}
              <g className="cat-whiskers" stroke="#f3f0f0" strokeWidth="1.2" strokeLinecap="round" opacity="0.9">
                <path className="whisk left-1" d="M44 74 q-14 -6 -30 -6" />
                <path className="whisk left-2" d="M46 80 q-16 0 -32 4" />
                <path className="whisk right-1" d="M96 74 q14 -6 30 -6" />
                <path className="whisk right-2" d="M94 80 q16 0 32 4" />
              </g>
            </g>
          </svg>
        </div>

        <Card className="w-full max-w-sm md:max-w-md shadow-none login-card" style={{ overflow: 'visible' }}>
        <CardHeader>
          <div className="flex">
            <Button
              variant={isSignUp ? 'ghost' : 'default'}
              size="sm"
              className="flex-1 rounded-r-none"
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </Button>
            <Button
              variant={isSignUp ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 rounded-l-none"
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </Button>
          </div>
          <CardTitle style={{ marginTop: '1cm' }}>{isSignUp ? 'Create account' : 'Sign in'}</CardTitle>
          {/* no subtitle shown for Sign In or Sign Up */}
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative" ref={suggestionsRef}>
              <label className="text-sm mb-1 block text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                required
                autoComplete="off"
              />
              {showSuggestions && savedEmails.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-card border border-card-border rounded-md z-50">
                  {savedEmails.filter(s => s.includes(email.trim().toLowerCase())).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                      onMouseDown={(ev) => {
                        // onMouseDown to select before blur
                        ev.preventDefault();
                        setEmail(s);
                        setShowSuggestions(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm mb-1 block text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <CardFooter className="pt-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
