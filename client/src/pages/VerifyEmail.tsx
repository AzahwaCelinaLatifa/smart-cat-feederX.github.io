import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function VerifyEmail() {
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState('We sent a confirmation link to your email. Please check your inbox and click the link.')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // try to read email from current session if any
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email || '')
    })()
  }, [])

  const resend = async () => {
    setError('')
    setSending(true)
    try {
      if (!email) throw new Error('Open Login and Sign Up again to resend the confirmation email.')
      const authAny: any = supabase.auth as any
      if (typeof authAny.resend === 'function') {
        const { error } = await authAny.resend({ type: 'signup', email })
        if (error) throw error
      } else {
        // Fallback: restart signUp flow with a random password to trigger email
        const { error } = await supabase.auth.signUp({ email, password: crypto.randomUUID() })
        if (error) throw error
      }
      setInfo('Confirmation email re-sent. Please check your inbox again.')
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='flex items-center justify-center h-full'>
      <Card className='w-[28rem]'>
        <CardHeader>
          <CardTitle>Email Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className='text-sm text-muted-foreground mb-4'>{info}</p>
          <div className='flex gap-2'>
            <Button onClick={resend} disabled={sending}>{sending ? 'Sending…' : 'Resend link'}</Button>
            <Button variant='outline' onClick={() => window.location.reload()}>I already clicked</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
