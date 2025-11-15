import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { getSchedules, addSchedule, updateSchedule, deleteSchedule, type ApiSchedule } from "@/lib/schedule";

export default function SchedulePage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Portion and Active are now implicit defaults (portion=1, active=true)
  const [intervals, setIntervals] = useState<number[]>([4, 6, 8]);
  // Start-on-detect is implicit (no toggle in UI)

  const refresh = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (e: any) {
      toast({ title: "Failed to load schedules", description: e?.message || String(e), variant: "destructive" });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Removed time-based helpers; schedule starts on detection implicitly

  const openAdd = () => {
    setEditingId(null);
    setIntervals([4, 6, 8]);
    setShowDialog(true);
  };

  const openEdit = (s: ApiSchedule) => {
    setEditingId(s.id);
    setIntervals(s.intervals && s.intervals.length ? s.intervals : [4, 6, 8]);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // validate intervals: must be array of positive integers
      if (!intervals || !intervals.length || intervals.some((n) => !Number.isFinite(n) || n <= 0)) {
        throw new Error("Please provide one or more positive interval values (hours)");
      }

      // Implicit defaults: portion=1, active=true
      const payload: any = { portion: 1, active: true };
      // Always use interval schedule, start on detection implicitly
      if (intervals && intervals.length) payload.intervals = intervals;
      payload.start_on_detect = true;

      if (editingId) {
        await updateSchedule(editingId, payload);
        toast({ title: "Updated", description: "Schedule updated" });
      } else {
        await addSchedule(payload);
        toast({ title: "Created", description: "Schedule created" });
      }
      setShowDialog(false);
      await refresh();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      toast({ title: "Deleted", description: "Schedule removed" });
      await refresh();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative">
        {/* Decorative paw icon in the background */}
        <div className="fixed right-4 bottom-20 pointer-events-none z-[60] opacity-10 transform rotate-6">
          {/* Decorative paw silhouette positioned above the bottom nav (fixed to viewport bottom-right) */}
          <svg
            className="w-52 h-52 md:w-64 md:h-64 text-primary"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
          >
            {/* main pad: wider horizontal oval ("tidur") rotated slightly */}
            <ellipse cx="34" cy="38" rx="14.5" ry="9" transform="rotate(-12 34 38)" fill="currentColor" />

            {/* toes: spaced a bit further apart and slightly offset from the pad */}
            <ellipse cx="18" cy="18" rx="4.8" ry="5.6" fill="currentColor" />
            <ellipse cx="26.5" cy="12.5" rx="4.4" ry="5.2" fill="currentColor" />
            <ellipse cx="38.5" cy="12.5" rx="4.4" ry="5.2" fill="currentColor" />
            <ellipse cx="50" cy="22" rx="4.8" ry="5.6" fill="currentColor" />

            {/* subtle inner highlight to add softness (very low opacity) */}
            <ellipse cx="34" cy="40" rx="7" ry="5" fill="white" opacity="0.03" />
          </svg>
        </div>
        <div className="z-10">
          <h1 className="text-3xl font-bold">Feeding Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cat's feeding times
          </p>
  </div>
  <div className="z-10">
    <Button onClick={openAdd}>
      <Plus className="h-4 w-4 mr-2" />
      Add
    </Button>
  </div>
</div>

  <div className="grid gap-3">
      {schedules.map((s) => {
        const hasIntervals = !!(s.intervals && s.intervals.length);
        const hasNext = s.next_time != null;
        const whenLabel = hasNext ? new Date(s.next_time as string).toLocaleString() : (hasIntervals ? 'Waiting for detection' : (s.time ? new Date(s.time).toLocaleString() : '—'));
        return (
          <Card key={s.id} className="border-l-4 border-l-primary">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xl font-semibold">{whenLabel}</div>
                  <div className="text-sm text-muted-foreground">
                    {hasIntervals ? (
                      <>
                        Intervals: {s.intervals!.map((n, i) => `${n}h${i < s.intervals!.length - 1 ? ' • ' : ''}`)} • Portion: {s.portion} • {s.active ? 'Active' : 'Inactive'}
                      </>
                    ) : (
                      <>Portion: {s.portion} • {s.active ? 'Active' : 'Inactive'}</>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Label className="w-28">Intervals (hours)</Label>
                <div className="flex-1">
                  {/* Helper text removed per request */}
                  {intervals.map((iv, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        step={1}
                        value={String(iv)}
                        onChange={(e) => {
                          // sanitize to integer >= 1
                          const raw = e.target.value || '';
                          const num = Math.max(1, parseInt(raw.replace(/\D/g, '') || '0', 10));
                          setIntervals((cur) => cur.map((c, i) => (i === idx ? num : c)));
                        }}
                        onKeyDown={(e: any) => {
                          // allow control keys and digits only
                          const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                          if (allowed.includes(e.key)) return;
                          if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                        }}
                        onPaste={(e: any) => {
                          const text = e.clipboardData.getData('Text') || '';
                          if (!/^\d+$/.test(text)) e.preventDefault();
                        }}
                        className="w-28"
                      />
                      <div className="text-sm text-muted-foreground">hours</div>
                      <Button variant="ghost" size="icon" onClick={() => setIntervals((cur) => cur.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setIntervals((cur) => [...cur, 4])}>
                      <Plus className="h-4 w-4 mr-2" /> Add interval
                    </Button>
                  </div>
                </div>
              </div>

              {/* Start on detect and start time controls removed */}

              {/* Portion and Active controls removed; they use defaults (1, active) */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); setEditingId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  // Fetch initial schedules handled in useEffect