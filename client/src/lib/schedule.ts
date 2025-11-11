// Supabase-backed schedule helpers via backend API
import { createSchedule as apiCreate, getSchedules as apiList, updateSchedule as apiUpdate, deleteSchedule as apiDelete } from "@/services/api";

export type ApiSchedule = {
  id: string;
  user_id: string;
  time: string; // ISO string
  portion: number;
  active: boolean;
};

export const addSchedule = async (data: { time: string; portion: number; active: boolean }) => {
  return await apiCreate(data);
};

export const getSchedules = async (): Promise<ApiSchedule[]> => {
  return await apiList();
};

export const updateSchedule = async (id: string, data: Partial<{ time: string; portion: number; active: boolean }>) => {
  return await apiUpdate(id, data);
};

export const deleteSchedule = async (id: string) => {
  return await apiDelete(id);
};