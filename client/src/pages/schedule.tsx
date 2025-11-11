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
  const [timeLocal, setTimeLocal] = useState(""); // datetime-local value
  const [portion, setPortion] = useState(1);
  const [active, setActive] = useState(true);

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

  const toIsoFromLocal = (local: string) => {
    if (!local) return "";
    // local is YYYY-MM-DDTHH:mm
    const d = new Date(local);
    return d.toISOString();
  };

  const toLocalFromIso = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const openAdd = () => {
    setEditingId(null);
    setTimeLocal("");
    setPortion(1);
    setActive(true);
    setShowDialog(true);
  };

  const openEdit = (s: ApiSchedule) => {
    setEditingId(s.id);
    setTimeLocal(toLocalFromIso(s.time));
    setPortion(s.portion);
    setActive(!!s.active);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const timeIso = toIsoFromLocal(timeLocal);
      if (!timeIso) throw new Error("Please provide date & time");
      if (!Number.isFinite(portion) || portion < 1 || portion > 10) throw new Error("Portion must be 1..10");

      if (editingId) {
        await updateSchedule(editingId, { time: timeIso, portion, active });
        toast({ title: "Updated", description: "Schedule updated" });
      } else {
        await addSchedule({ time: timeIso, portion, active });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feeding Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cat's feeding times
          </p>
          
        </div>
        <div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
  </div>

  <div className="grid gap-3">
      {schedules.map((s) => {
        const when = new Date(s.time).toLocaleString();
        return (
          <Card key={s.id} className="border-l-4 border-l-primary">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xl font-semibold">{when}</div>
                  <div className="text-sm text-muted-foreground">Portion: {s.portion} • {s.active ? 'Active' : 'Inactive'}</div>
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
              <div className="flex items-center gap-3">
                <Label className="w-28">Time</Label>
                <Input type="datetime-local" value={timeLocal} onChange={(e) => setTimeLocal(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-28">Portion (1..10)</Label>
                <Input
                  inputMode="numeric"
                  value={portion}
                  onChange={(e) => setPortion(Math.max(1, Math.min(10, Number(e.target.value || 0))))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="w-28">Active</Label>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              </div>
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