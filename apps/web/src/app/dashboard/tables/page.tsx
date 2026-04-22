'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Grid, Play, Settings2, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { apiClient } from '@/lib/api-client';

export default function FloorPlanManagement() {
  const [tables, setTables] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTable, setNewTable] = useState({ name: '', capacity: 2, branchId: '' });
  const [editingTable, setEditingTable] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Confirmation States
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; tableId: string | null }>({ isOpen: false, tableId: null });
  const [confirmAutoArrange, setConfirmAutoArrange] = useState(false);

  // Drag State
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, branchesRes] = await Promise.all([
        apiClient.get('/tables'),
        apiClient.get('/branches')
      ]);
      setTables(tablesRes.data.map((t: any) => ({ ...t, x: t.x || 0, y: t.y || 0 })));
      setBranches(branchesRes.data);
      if (branchesRes.data.length > 0) {
        setNewTable(prev => ({ ...prev, branchId: branchesRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching tables data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    try {
      // Place new table in center roughly
      const payload = { ...newTable, x: 200, y: 200 };
      await apiClient.post('/tables', payload);
      fetchData();
      setIsAddOpen(false);
      setNewTable({ name: '', capacity: 2, branchId: branches[0]?.id || '' });
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const toggleStatus = async (id: string, nextStatus: string) => {
    try {
      await apiClient.patch(`/tables/${id}/status`, { status: nextStatus });
      setTables(tables.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleUpdateTable = async () => {
    if (!editingTable) return;
    try {
      await apiClient.patch(`/tables/${editingTable.id}`, { name: editingTable.name, capacity: editingTable.capacity });
      setTables(tables.map(t => t.id === editingTable.id ? { ...t, name: editingTable.name, capacity: editingTable.capacity } : t));
      setEditingTable(null);
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await apiClient.delete(`/tables/${id}`);
      setTables(tables.filter(t => t.id !== id));
      setConfirmDelete({ isOpen: false, tableId: null });
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  // Drag and Drop Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click drag
    
    // Support touch layer properly
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    const tableElement = e.currentTarget;
    const rect = tableElement.getBoundingClientRect();
    
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    setDraggedTableId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedTableId || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - offsetRef.current.x;
    let newY = e.clientY - containerRect.top - offsetRef.current.y;

    // Boundary constraints
    newX = Math.max(0, Math.min(newX, containerRect.width - 100)); // assume table mostly ~100px wide
    newY = Math.max(0, Math.min(newY, containerRect.height - 100));

    setTables(prev => prev.map(t => t.id === draggedTableId ? { ...t, x: newX, y: newY } : t));
  };

  const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedTableId) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const table = tables.find(t => t.id === draggedTableId);
    setDraggedTableId(null);

    if (table) {
       try {
         // Persist position quietly
         await apiClient.patch(`/tables/${table.id}`, { x: table.x, y: table.y });
       } catch (error) {
         console.error("Failed to save coordinates", error);
       }
    }
  };

  const handleAutoArrange = async () => {
    // Group and sort
    const groups: { [key: string]: any[] } = {};
    tables.forEach(table => {
      let category = 'General';
      if (table.name.includes('-')) {
        category = table.name.split('-')[0].trim();
      } else if (table.name.toLowerCase().includes('smoke')) {
        category = 'Smoke';
      }
      if (!groups[category]) groups[category] = [];
      groups[category].push(table);
    });

    const startX = 50;
    const startY = 50;
    const paddingX = 140;
    const paddingY = 120;
    const maxPerRow = 6;

    let currentY = startY;
    const updatedTables = [...tables];

    for (const category of Object.keys(groups)) {
      let currentX = startX;
      let countInRow = 0;
      const sortedInGroup = groups[category].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      for (const table of sortedInGroup) {
        const foundIndex = updatedTables.findIndex(t => t.id === table.id);
        if (foundIndex !== -1) {
          updatedTables[foundIndex] = { ...updatedTables[foundIndex], x: currentX, y: currentY };
          // Save to backend quietly
          apiClient.patch(`/tables/${table.id}`, { x: currentX, y: currentY }).catch(console.error);
        }

        currentX += paddingX;
        countInRow++;
        if (countInRow >= maxPerRow) {
          currentX = startX;
          currentY += paddingY;
          countInRow = 0;
        }
      }
      currentY += paddingY; 
    }

    setTables(updatedTables);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-emerald-200';
      case 'OCCUPIED': return 'bg-amber-100 border-amber-500 text-amber-900 shadow-amber-200';
      case 'BILL_PENDING': return 'bg-rose-100 border-rose-500 text-rose-900 shadow-rose-200';
      case 'RESERVED': return 'bg-blue-100 border-blue-500 text-blue-900 shadow-blue-200';
      default: return 'bg-slate-100 border-slate-500 text-slate-900';
    }
  };

  const getCanvasItemClasses = (capacity: number) => {
    if (capacity >= 4) {
      return "w-32 h-20 rounded-xl px-2 py-4"; // Rectangle for larger tables
    }
    return "w-24 h-24 rounded-full flex flex-col justify-center items-center"; // Circle for small tables
  };

  if (loading) return <div className="h-full flex items-center justify-center p-20">Loading Floor Plan...</div>;

  return (
    <>
      <div className="space-y-6 max-w-[1600px] mx-auto flex flex-col pb-20">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Floor Plan Manager</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Drag tables to adjust layout</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                onClick={() => setConfirmAutoArrange(true)}
                className="font-bold tracking-wider uppercase text-xs h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
                <Grid className="mr-2 h-4 w-4" /> Auto-Arrange
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger 
                render={
                  <Button className="font-bold tracking-wider uppercase text-xs h-10 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Add Table
                  </Button>
                }
              />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Table Name / Number</Label>
                  <Input 
                    placeholder="e.g. Table 5 or Window A1" 
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (Seating)</Label>
                  <Input 
                    type="number" 
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500 italic mt-1">Note: 1-3 seats will render as a circle. 4+ seats will render as a rectangle.</p>
                </div>
                <Button onClick={handleCreateTable} className="w-full bg-indigo-600">Drop Table to Canvas</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-2">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> Free</div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Occupied</div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-rose-400"></div> Bill Pending</div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Reserved</div>
        </div>

        {/* Canvas Area */}
        <div 
          className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 relative min-h-[1000px] shadow-inner"
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
           {/* Grid Pattern Background */}
           <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

           {tables.map(table => (
              <Popover key={table.id}>
                <PopoverTrigger
                  render={
                    <div 
                      className={`absolute cursor-grab active:cursor-grabbing border-4 shadow-xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 ${getStatusColor(table.status)} ${getCanvasItemClasses(table.capacity)}`}
                      style={{ 
                        left: `${table.x}px`, 
                        top: `${table.y}px`,
                        zIndex: draggedTableId === table.id ? 50 : 10
                      }}
                      onPointerDown={(e) => handlePointerDown(e, table.id)}
                    >
                       <span className="font-black text-lg tracking-tighter shadow-sm">{table.name.includes('-') ? table.name.split('-')[1].trim() : table.name}</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">👤 {table.capacity} Seats</span>
                    </div>
                  }
                />
                <PopoverContent className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100" side="top">
                   <div className="p-2 border-b border-slate-100 mb-2">
                      <h4 className="font-black text-slate-900">{table.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{table.status.replace('_', ' ').toLowerCase()}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      {table.status === 'AVAILABLE' ? (
                         <Button variant="ghost" size="sm" className="justify-start font-bold text-slate-700" onClick={() => toggleStatus(table.id, 'OCCUPIED')}>
                           <CheckCircle2 className="mr-2 h-4 w-4 text-amber-500" /> Walk-in (Occupy)
                         </Button>
                      ) : (
                         <Button variant="ghost" size="sm" className="justify-start font-bold text-slate-700" onClick={() => toggleStatus(table.id, 'AVAILABLE')}>
                           <XCircle className="mr-2 h-4 w-4 text-emerald-500" /> Mark Available
                         </Button>
                      )}
                      
                      {table.status !== 'BILL_PENDING' && table.status !== 'AVAILABLE' && (
                        <Button variant="ghost" size="sm" className="justify-start font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => toggleStatus(table.id, 'BILL_PENDING')}>
                          <Play className="mr-2 h-4 w-4" /> Request Bill
                        </Button>
                      )}

                      <hr className="my-1 border-slate-50" />
                      
                      <Button variant="ghost" size="sm" className="justify-start font-bold text-slate-700" onClick={() => setEditingTable(table)}>
                         <Settings2 className="mr-2 h-4 w-4 text-slate-400" /> Edit Capacity
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmDelete({ isOpen: true, tableId: table.id })}>
                         <Trash2 className="mr-2 h-4 w-4" /> Remove Table
                      </Button>
                   </div>
                </PopoverContent>
              </Popover>
           ))}

           {tables.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <Grid className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-bold text-xl">The floor is empty.</p>
                <p className="text-sm">Add a table using the toolbar above to begin.</p>
              </div>
           )}
        </div>
      </div>

      <Dialog open={!!editingTable} onOpenChange={(open) => !open && setEditingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Table Name / Number</Label>
              <Input 
                value={editingTable?.name || ''}
                onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity (Seating)</Label>
              <Input 
                type="number" 
                value={editingTable?.capacity || 2}
                onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleUpdateTable} className="w-full bg-indigo-600">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal 
          isOpen={confirmDelete.isOpen}
          onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, isOpen: open })}
          title="Delete Table?"
          description="This action cannot be undone. All layout data for this table will be removed."
          confirmText="Yes, Delete Table"
          type="danger"
          onConfirm={() => {
            if (confirmDelete.tableId) handleDeleteTable(confirmDelete.tableId);
          }}
        />

        <ConfirmationModal 
          isOpen={confirmAutoArrange}
          onOpenChange={setConfirmAutoArrange}
          title="Auto-Arrange Layout?"
          description="This will instantly organize all 40+ tables into neat rows by category. Do you want to continue?"
          confirmText="Magic Arrange"
          type="warning"
          onConfirm={() => {
            setConfirmAutoArrange(false);
            handleAutoArrange();
          }}
        />
    </>
  );
}
