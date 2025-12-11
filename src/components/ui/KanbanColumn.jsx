import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import LeadCard from "./LeadCard";

export default function KanbanColumn({
  id,
  title,
  count,
  leads,
  onStatusChange,
  onDelete,
  onEdit,
  onAssign,
  canAssign,
  index,
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="w-80 flex flex-col h-full">
      {/* Column Header - Breadcrumb Style */}
      <div
        className="bg-theme text-white h-12 flex items-center justify-center relative mb-2"
        style={{
          clipPath:
            index === 0
              ? "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%)",
        }}
      >
        <h2 className="text-themeDark font-medium text-sm flex items-center gap-1">
          <p className="text-white">{title}</p>
          <span className="text-blue-300">({count})</span>
        </h2>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="bg-white p-2 flex-1 overflow-y-auto border border-borderColor rounded-b-xl scrollbar-thin scrollbar-thumb-gray-300 min-h-[150px]"
      >
        <SortableContext
          id={id}
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
              onAssign={onAssign}
              canAssign={canAssign}
            />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
