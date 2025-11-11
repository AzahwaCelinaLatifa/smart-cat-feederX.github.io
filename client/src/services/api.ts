import { supabase } from '../lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Unauthenticated')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  }
}

export async function manualFeed(portion: number) {
  const res = await fetch(`${API_BASE}/api/feed/manual`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ portion })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getSchedules() {
  const res = await fetch(`${API_BASE}/api/schedule`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createSchedule(schedule: { time: string; portion: number; active: boolean }) {
  const res = await fetch(`${API_BASE}/api/schedule`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(schedule)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateSchedule(id: string, updates: Partial<{ time: string; portion: number; active: boolean }>) {
  const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(updates)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteSchedule(id: string) {
  const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
  return true
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/api/history`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getStatus() {
  const res = await fetch(`${API_BASE}/api/status`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
