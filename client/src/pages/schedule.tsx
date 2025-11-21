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

interface LocalSchedule {
  id: string;
  intervals: number[];
  portion: number;
  active: boolean;
}

const STORAGE_KEY = 'feeding_schedules';

export default function SchedulePage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<LocalSchedule[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [intervals, setIntervals] = useState<number[]>([4, 6, 8]);

  const loadSchedules = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSchedules(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load schedules from localStorage', e);
    }
  };

  const saveSchedules = (newSchedules: LocalSchedule[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (e) {
      console.error('Failed to save schedules to localStorage', e);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setIntervals([4, 6, 8]);
    setShowDialog(true);
  };

  const openEdit = (s: LocalSchedule) => {
    setEditingId(s.id);
    setIntervals(s.intervals && s.intervals.length ? s.intervals : [4, 6, 8]);
    setShowDialog(true);
  };

  const handleSave = () => {
    try {
      if (!intervals || !intervals.length || intervals.some((n) => !Number.isFinite(n) || n <= 0)) {
        throw new Error("Please provide one or more positive interval values (hours)");
      }

      if (editingId) {
        const updated = schedules.map(s => 
          s.id === editingId 
            ? { ...s, intervals, portion: 1, active: true }
            : s
        );
        saveSchedules(updated);
        toast({ title: "Updated", description: "Schedule updated" });
      } else {
        const newSchedule: LocalSchedule = {
          id: Date.now().toString(),
          intervals,
          portion: 1,
          active: true
        };
        saveSchedules([...schedules, newSchedule]);
        toast({ title: "Created", description: "Schedule created" });
      }
      setShowDialog(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    try {
      const filtered = schedules.filter(s => s.id !== deleteId);
      saveSchedules(filtered);
      toast({ title: "Deleted", description: "Schedule removed" });
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" style={{marginTop: '-20px', paddingTop: '0'}}>
      <div className="flex items-center justify-between relative" style={{marginTop: '0', paddingTop: '0'}}>
        <div className="z-10" style={{marginTop: '0', paddingTop: '0'}}>
          <h1 
            className="text-3xl font-bold mb-6"
            style={{
              color: '#174143',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.84px',
              marginTop: '0'
            }}
          >
            Feeding Schedule
          </h1>
          <p 
            className="text-muted-foreground"
            style={{
              color: '#174143',
              fontFamily: 'Montserrat',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.42px',
              marginTop: '-10px'
            }}
          >
            Manage your cat's feeding times
          </p>
  </div>
  <div className="z-10">
    <Button 
      onClick={openAdd}
      disabled={schedules.length > 0}
      style={{
        width: '95px',
        height: '48px',
        flexShrink: 0,
        background: schedules.length > 0 ? '#CCCCCC' : 'linear-gradient(90deg, #427A76 0.01%, #174143 50.5%)',
        filter: 'drop-shadow(0 3px 3.2px rgba(0, 0, 0, 0.25))',
        border: 'none',
        color: '#FFF',
        textAlign: 'center',
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 'normal',
        letterSpacing: '0.42px',
        cursor: schedules.length > 0 ? 'not-allowed' : 'pointer',
        opacity: schedules.length > 0 ? 0.6 : 1
      }}
    >
      <img 
        src="/assets/tabler_plus.svg"
        alt="Add"
        className="mr-2"
        style={{
          width: '24px',
          height: '24px',
          flexShrink: 0,
          aspectRatio: '1/1',
          objectFit: 'contain',
          filter: 'none'
        }}
      />
      Add
    </Button>
  </div>
</div>



      {/* Schedules List */}
      <div className="space-y-4 mb-8">
        {schedules.length === 0 ? (
          <Card className="p-8 text-center">
            <p 
              style={{
                color: '#6C6C6C',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              No schedules yet. Click "Add" to create your first feeding schedule.
            </p>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card 
              key={schedule.id}
              style={{
                borderRadius: '20px',
                border: '0.5px solid #797979',
                background: 'linear-gradient(180deg, #F5E5E1 7.21%, #FFF6F4 100%)',
                padding: '16px'
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock 
                        className="h-5 w-5" 
                        style={{ color: '#174143' }}
                      />
                      <h3 
                        style={{
                          color: '#174143',
                          fontFamily: 'Poppins',
                          fontSize: '16px',
                          fontWeight: 600,
                          letterSpacing: '0.48px'
                        }}
                      >
                        Feeding Intervals
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {schedule.intervals.map((interval, idx) => (
                        <div 
                          key={idx}
                          className="text-white"
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: '#427A76',
                            fontFamily: 'Montserrat',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {interval} hours
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(schedule)}
                      style={{
                        color: '#174143'
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(schedule.id)}
                    >
                      <img 
                        src="/assets/uil_trash.svg"
                        alt="Delete"
                        className="h-5 w-5"
                        style={{
                          objectFit: 'contain',
                          filter: 'none'
                        }}
                      />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          style={{
            borderRadius: '18px',
            background: 'linear-gradient(90deg, #FFF 0.01%, #FFF 50.5%)',
            boxShadow: '0 3px 3.2px -1px rgba(0, 0, 0, 0.25)'
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle 
              style={{
                color: '#174143',
                textAlign: 'center',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.6px'
              }}
            >
              {editingId ? "Edit Schedule" : "Add Schedule"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Label 
                  className="w-28"
                  style={{
                    color: '#174143',
                    textAlign: 'center',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: '0.42px'
                  }}
                >
                  Intervals
                </Label>
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
                        style={{
                          borderRadius: '20px',
                          border: '0.5px solid #797979'
                        }}
                      />
                      <div 
                        className="text-sm text-muted-foreground"
                        style={{
                          color: '#6C6C6C',
                          fontFamily: 'Montserrat',
                          fontSize: '12px',
                          fontStyle: 'normal',
                          fontWeight: 300,
                          lineHeight: 'normal',
                          letterSpacing: '0.36px'
                        }}
                      >
                        hours
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIntervals((cur) => cur.filter((_, i) => i !== idx))}>
                        <img 
                          src="/assets/uil_trash.svg"
                          alt="Delete"
                          className="h-4 w-4"
                          style={{
                            objectFit: 'contain',
                            filter: 'none'
                          }}
                        />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setIntervals((cur) => [...cur, 4])}
                      style={{
                        width: '111px',
                        height: '25px',
                        flexShrink: 0,
                        borderRadius: '20px',
                        background: 'linear-gradient(90deg, #427A76 0.01%, #174143 50.5%)',
                        filter: 'drop-shadow(0 3px 3.2px rgba(0, 0, 0, 0.25))',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        paddingLeft: '6px',
                        paddingRight: '6px'
                      }}
                    >
                      <img 
                        src="/assets/tabler_plus.svg"
                        alt="Add"
                        style={{
                          width: '17px',
                          height: '17px',
                          flexShrink: 0,
                          aspectRatio: '1/1',
                          objectFit: 'contain',
                          filter: 'none',
                          marginRight: '4px'
                        }}
                      /> 
                      Add interval
                    </Button>
                  </div>
                </div>
              </div>

              {/* Start on detect and start time controls removed */}

              {/* Portion and Active controls removed; they use defaults (1, active) */}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleSave}
              style={{
                width: '217px',
                height: '29px',
                borderRadius: '20px',
                background: '#173536',
                color: '#FFF',
                textAlign: 'center',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.42px',
                border: 'none'
              }}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setShowDialog(false); setEditingId(null); }}
              style={{
                width: '217px',
                height: '29px',
                borderRadius: '20px',
                border: '0.5px solid #797979',
                color: '#174143',
                textAlign: 'center',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.42px',
                background: 'transparent'
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          style={{
            borderRadius: '18px',
            background: 'linear-gradient(90deg, #FFF 0.01%, #FFF 50.5%)',
            boxShadow: '0 3px 3.2px -1px rgba(0, 0, 0, 0.25)'
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle 
              style={{
                color: '#174143',
                textAlign: 'center',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.6px'
              }}
            >
              Delete Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p 
              style={{
                color: '#6C6C6C',
                textAlign: 'center',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.5'
              }}
            >
              Are you sure you want to delete this feeding schedule?
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button 
              onClick={confirmDelete}
              style={{
                width: '217px',
                height: '29px',
                borderRadius: '20px',
                background: '#815247',
                color: '#FFF',
                textAlign: 'center',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.42px',
                border: 'none'
              }}
              className="hover:opacity-90"
            >
              Delete
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setShowDeleteDialog(false); setDeleteId(null); }}
              style={{
                width: '217px',
                height: '29px',
                borderRadius: '20px',
                border: '0.5px solid #797979',
                color: '#174143',
                textAlign: 'center',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '0.42px',
                background: 'transparent'
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decorative image at bottom right corner */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '407px',
          height: '229px',
          flexShrink: 0,
          background: 'url(/assets/7817fd7fd11a4aff61de9fcb7c91902ed009fa47.png) white 5% / cover no-repeat',
          zIndex: 1,
          opacity: 1
        }}
      />
    </div>
  );
}
  // Fetch initial schedules handled in useEffect