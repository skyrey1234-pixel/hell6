import React from "react";
import { Link } from "react-router-dom";
import { Draggable } from "@hello-pangea/dnd";

export default function KanbanCard({ prospect, index }) {
  const score = prospect.opportunity_score || 0;
  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-slate-400";

  return (
    <Draggable draggableId={prospect.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-[#0B0E14] border rounded-xl p-3 mb-2 ${snapshot.isDragging ? "border-amber-500/60 shadow-lg shadow-amber-500/10" : "border-slate-800 hover:border-slate-700"} transition-colors`}
        >
          <div className="flex items-start justify-between gap-2">
            <Link to={`/prospect/${prospect.id}`} className="text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors leading-snug">
              {prospect.business_name}
            </Link>
            <span className={`text-xs font-bold shrink-0 ${scoreColor}`}>{score}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{prospect.industry}</div>
        </div>
      )}
    </Draggable>
  );
}