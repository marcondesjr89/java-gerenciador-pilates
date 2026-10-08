"use client";

import { useState } from "react";
import { Ban, Plus } from "lucide-react";
import { CreateSlotModal } from "@/app/agenda/create-slot-modal";
import { CreateBlockModal } from "@/app/agenda/create-block-modal";
import type { InstructorUser } from "@/lib/users";

type AgendaHeaderActionsProps = {
  selectedDate: string;
  instructors: InstructorUser[];
};

export function AgendaHeaderActions({ selectedDate, instructors }: AgendaHeaderActionsProps) {
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsSlotModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Horário</span>
        </button>

        <button
          type="button"
          onClick={() => setIsBlockModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-[rgba(220,53,69,0.3)] bg-[rgba(220,53,69,0.08)] px-4 py-2.5 text-sm font-semibold text-brand-danger transition hover:bg-[rgba(220,53,69,0.14)] focus:outline-none focus:ring-2 focus:ring-brand-danger focus:ring-offset-2"
        >
          <Ban className="h-4 w-4" />
          <span>Bloquear Horário</span>
        </button>
      </div>

      <CreateSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        selectedDate={selectedDate}
        instructors={instructors}
      />

      <CreateBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        selectedDate={selectedDate}
        instructors={instructors}
      />
    </>
  );
}
