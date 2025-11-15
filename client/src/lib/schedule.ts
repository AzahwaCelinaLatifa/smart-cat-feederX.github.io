// Supabase-backed schedule helpers via backend API
import { createSchedule as apiCreate, getSchedules as apiList, updateSchedule as apiUpdate, deleteSchedule as apiDelete } from "@/services/api";

export type ApiSchedule = {
  id: string;
  user_id: string;
  // either a concrete start time (ISO) or an interval-based schedule
  time?: string; // ISO string
  intervals?: number[]; // sequence of hours between feeds, e.g. [4,6,8]
  start_on_detect?: boolean; // if true, schedule starts when camera detects animal
  next_time?: string | null; // next actionable time for cron
  interval_index?: number;
  portion: number;
  active: boolean;
};

// Accepts either a time-based schedule or an interval-based schedule
export const addSchedule = async (data: { time?: string; intervals?: number[]; portion: number; active: boolean; start_on_detect?: boolean }) => {
  return await apiCreate(data as any);
};

export const getSchedules = async (): Promise<ApiSchedule[]> => {
  return await apiList();
};

export const updateSchedule = async (id: string, data: Partial<{ time?: string; intervals?: number[]; portion: number; active: boolean; start_on_detect?: boolean }>) => {
  return await apiUpdate(id, data as any);
};

export const deleteSchedule = async (id: string) => {
  return await apiDelete(id);
};