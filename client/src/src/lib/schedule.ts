// schedule.ts
import rtdbApp, { getDatabase, ref, push, remove, update, onValue, off } from "@/lib/firebase";

const rtdb = getDatabase(rtdbApp);
const SCHEDULES_REF = ref(rtdb, "schedules");

// Add schedule
// schedule: { intervals: number[]; amount: number }
export const addSchedule = async (schedule: { intervals: number[]; amount: number }) => {
  await push(SCHEDULES_REF, schedule);
};

// Delete schedule
export const deleteSchedule = async (id: string) => {
  await remove(ref(rtdb, `schedules/${id}`));
};

// Update jadwal
export const updateSchedule = async (
  id: string,
  schedule: { intervals: number[]; amount: number }
) => {
  await update(ref(rtdb, `schedules/${id}`), schedule);
};

// Listener realtime (otomatis update UI)
export const listenSchedules = (
  callback: (schedules: { id: string; intervals?: number[]; time?: string; amount?: number }[]) => void
) => {
  onValue(SCHEDULES_REF, (snapshot) => {
    const data = snapshot.val();
    const result = data
      ? Object.entries(data).map(([id, value]: any) => ({
          id,
          ...(value as { intervals?: number[]; time?: string; amount?: number }),
        }))
      : [];
    callback(result);
  });

  return () => off(SCHEDULES_REF); // untuk unsubscribe
};
