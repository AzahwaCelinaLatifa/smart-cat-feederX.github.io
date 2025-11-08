import { useState } from "react";
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

  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-96">
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
            <div>
              <label className="text-sm mb-1 block text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
  );
}
