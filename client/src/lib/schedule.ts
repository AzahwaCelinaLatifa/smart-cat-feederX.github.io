import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "@/lib/firebase";

const scheduleRef = collection(db, "feedingSchedules");

// Add schedule
// data: { intervals: number[]; amount: number }
export const addSchedule = async (data: { intervals: number[]; amount: number }) => {
  return await addDoc(scheduleRef, data);
};

// Get all schedules
export const getSchedules = async () => {
  const snapshot = await getDocs(scheduleRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update schedule
export const updateSchedule = async (id: string, data: any) => {
  const ref = doc(db, "feedingSchedules", id);
  return await updateDoc(ref, data);
};

// Delete schedule
export const deleteSchedule = async (id: string) => {
  const ref = doc(db, "feedingSchedules", id);
  return await deleteDoc(ref);
};