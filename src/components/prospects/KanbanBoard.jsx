import React from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import KanbanCard from "@/components/prospects/KanbanCard";

const COLUMNS = [
  { value: "new", label: "New", accent: "text-sky-400 border-sky-500/30" },
  { value: "proposal_sent", label: "Contacted", accent: "text-violet-400 border-violet-500/30" },
  { value: "replied", label: "Interested", accent: "text-emerald-400 border-emerald-500/30" },
  { value: "demo_created", label: "Demo Ready", accent: "text-amber-400 border-amber-500/30" },
  { value: "won", label: "Converted", accent: "text-emerald-300 border-emerald-400/40" },
  { value: "lost", label: "Lost", accent: "text-slate-400 border-slate-600" }
];

export default function KanbanBoard({ prospects, onStatusChange }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    if (newStatus === result.source.droppableId) return;
    onStatusChange(result.draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = prospects.filter((p) => (p.status || "new") === col.value);
          return (
            <div key={col.value} className="w-64 shrink-0">
              <div className={`flex items-center justify-between border-b-2 ${col.accent} pb-2 mb-3`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${col.accent.split(" ")[0]}`}>{col.label}</span>
                <span className="text-xs text-slate-500">{items.length}</span>
              </div>
              <Droppable droppableId={col.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[120px] rounded-xl p-1 transition-colors ${snapshot.isDraggingOver ? "bg-slate-800/40" : ""}`}
                  >
                    {items.map((p, i) => <KanbanCard key={p.id} prospect={p} index={i} />)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}