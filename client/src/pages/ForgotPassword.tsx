import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email required'); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-full'>
      <Card className='w-96'>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant='destructive' className='mb-4'><AlertDescription>{error}</AlertDescription></Alert>}
          {sent ? (
            <p className='text-sm text-muted-foreground'>Check your email for the reset link.</p>
          ) : (
            <form onSubmit={handleSend} className='space-y-3'>
              <div>
                <label className='text-sm mb-1 block text-muted-foreground'>Email</label>
                <Input type='email' value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <CardFooter className='pt-0'>
                <button 
                  type='submit' 
                  className='w-full' 
                  disabled={loading}
                  style={{
                    borderRadius: '30px',
                    background: '#174143',
                    color: '#FFFFFF',
                    WebkitTextFillColor: '#FFFFFF',
                    padding: '12px 24px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    fontFamily: 'Montserrat',
                    fontSize: '16px',
                    fontWeight: 600,
                    height: '44px'
                  }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
