import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Edit3, X } from "lucide-react";
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

// Service (use RTDB-backed schedule helpers so listener updates when we push new schedules)
import { addSchedule, updateSchedule, listenSchedules } from "@/src/lib/schedule";

type Schedule = {
  id: string;
  // either legacy time-based schedules have `time`, new ones have `intervals`
  time?: string;
  intervals?: number[];
  amount?: number;
};

export default function SchedulePage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // interval input fields shown in the Add dialog (vertical list). Start with 3 empty fields.
  // start with sensible defaults shown in each column
  const [intervalInputs, setIntervalInputs] = useState<string[]>(["4", "6", "8"]);
  // Fixed amount for interval schedules (cannot be edited in Add flow)
  const fixedAmount = 50;

  // Listener realtime
  useEffect(() => {
    const unsubscribe = listenSchedules((data) => setSchedules(data));
    return () => unsubscribe();
  }, []);

  // Add
  const handleAddSchedule = async () => {
    // collect non-empty inputs
    const parts = intervalInputs.map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      toast({ title: "No intervals", description: `Please enter at least one interval in hours.` });
      return;
    }
    const intervals: number[] = [];
    for (const p of parts) {
      const n = Number(p);
      if (Number.isNaN(n) || n <= 0) {
        toast({ title: "Invalid interval", description: `\"${p}\" is not a valid positive number of hours` });
        return;
      }
      intervals.push(n);
    }

    await addSchedule({ intervals, amount: fixedAmount });
    setShowAddDialog(false);
    setIntervalInputs(["", "", ""]);
    toast({
      title: "Added",
      description: `Interval schedule: ${intervals.join("h, ")}h • ${fixedAmount}g per feed`,
    });
  };

  // Update
  const handleUpdateSchedule = async () => {
    if (!editingId) return;
    const parts = intervalInputs.map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      toast({ title: "No intervals", description: `Please enter at least one interval in hours.` });
      return;
    }
    const intervals: number[] = [];
    for (const p of parts) {
      const n = Number(p);
      if (Number.isNaN(n) || n <= 0) {
        toast({ title: "Invalid interval", description: `"${p}" is not a valid positive number of hours` });
        return;
      }
      intervals.push(n);
    }

    await updateSchedule(editingId, { intervals, amount: fixedAmount });
    setShowAddDialog(false);
    setEditingId(null);
    setIntervalInputs(["", "", ""]);
    toast({ title: "Updated", description: `Schedule updated: ${intervals.join("h, ")}h • ${fixedAmount}g` });
  };

  // Note: deletion disabled in UI; users can edit schedules instead

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feeding Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cat's feeding times
          </p>
          
        </div>
        <div>
        <Button onClick={() => { setEditingId(null); setIntervalInputs(["4","6","8"]); setShowAddDialog(true); }} disabled={schedules.length > 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
  </div>
  </div>

  <div className="grid gap-3">
                {schedules.map((schedule) => {
                  const labelPrimary = schedule.intervals
                    ? `${schedule.intervals.join("h, ")}h`
                    : schedule.time
                    ? `${formatTime(schedule.time)}`
                    : "Schedule";
                  return (
                    <Card key={schedule.id} className="border-l-4 border-l-primary">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <div className="text-xl font-semibold">{labelPrimary}</div>
                            {schedule.intervals ? (
                              <div className="text-sm text-muted-foreground">Starts on first detection</div>
                            ) : null}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // open edit dialog pre-filled
                            setEditingId(schedule.id);
                            setIntervalInputs((schedule.intervals ?? []).map(String));
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
      </div>

      {/* Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Intervals (hours)</Label>
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  {intervalInputs.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input
                        value={val}
                        inputMode="numeric"
                        pattern="\d*"
                        onKeyDown={(e) => {
                          const allowedKeys = [
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                            "Tab",
                            "Home",
                            "End",
                          ];
                          if (allowedKeys.includes(e.key)) return;
                          if (/^[0-9]$/.test(e.key)) return;
                          e.preventDefault();
                        }}
                        onPaste={(e) => {
                          const text = e.clipboardData.getData("text");
                          if (!/^[0-9]+$/.test(text)) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          setIntervalInputs((s) => s.map((v, i) => (i === idx ? cleaned : v)));
                        }}
                        onBlur={() => {
                          setIntervalInputs((s) =>
                            s.map((v, i) => {
                              if (i !== idx) return v;
                              if (!v) return v;
                              const n = Math.max(1, Math.min(24, Number(v)));
                              return String(n);
                            })
                          );
                        }}
                        placeholder={`${idx + 1} (hours)`}
                        className="flex-1"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIntervalInputs((s) => s.filter((_, i) => i !== idx))}
                        aria-label={`Remove interval ${idx + 1}`}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIntervalInputs((s) => [...s, ""]) }
                    data-testid="button-add-interval-field"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add interval
                  </Button>
                </div>
              </div>
            </div>
            {/* Amount is fixed for interval schedules and set to the default value */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingId(null); }}>
              Cancel
            </Button>
            <Button onClick={() => (editingId ? handleUpdateSchedule() : handleAddSchedule())}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  // Fetch initial schedules (in case listener misses any)