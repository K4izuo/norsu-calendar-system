"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Minus, Package, Pencil, Plus, Save, StickyNote, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useUpdateReservationEquipment } from "@/features/calendar/services/reservation-service";
import { EventDetails, ReservationEquipmentItem } from "@/interface/user-props";

type EditableEquipmentItem = ReservationEquipmentItem & {
  note: string;
};

interface EquipmentCardProps {
  event: EventDetails;
  status: "PENDING" | "APPROVED" | "DECLINED";
  userRoleNumber?: number;
}

const normalizeEquipment = (equipment: EventDetails["equipment"]): EditableEquipmentItem[] =>
  (equipment ?? [])
    .filter((item): item is ReservationEquipmentItem => Boolean(item?.name))
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      note: item.note ?? "",
    }));

export function EquipmentCard({ event, status, userRoleNumber }: EquipmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [equipment, setEquipment] = useState<EditableEquipmentItem[]>(() => normalizeEquipment(event.equipment));
  const [draftEquipment, setDraftEquipment] = useState<EditableEquipmentItem[]>(equipment);
  const [generalRemark, setGeneralRemark] = useState(event.multimedia_comment ?? "");
  const [draftGeneralRemark, setDraftGeneralRemark] = useState(generalRemark);
  const { mutate: saveEquipment, isPending } = useUpdateReservationEquipment();

  const canViewRemarks = typeof userRoleNumber === "number";
  const canEdit = userRoleNumber === 11 && status === "PENDING";
  const hasEquipment = equipment.length > 0;
  const hasGeneralRemark = generalRemark.trim().length > 0;
  const hasItemRemarks = equipment.some((item) => item.note.trim().length > 0);
  const canSaveDraft = draftEquipment.every((item) => typeof item.id === "number");

  const displayEquipment = isEditing ? draftEquipment : equipment;
  const displayGeneralRemark = isEditing ? draftGeneralRemark : generalRemark;

  const remarkSectionVisible = useMemo(
    () => canViewRemarks && (canEdit || hasGeneralRemark || hasItemRemarks),
    [canEdit, canViewRemarks, hasGeneralRemark, hasItemRemarks],
  );

  useEffect(() => {
    const nextEquipment = normalizeEquipment(event.equipment);
    const nextRemark = event.multimedia_comment ?? "";

    setEquipment(nextEquipment);
    setDraftEquipment(nextEquipment);
    setGeneralRemark(nextRemark);
    setDraftGeneralRemark(nextRemark);
    setIsEditing(false);
  }, [event.id, event.equipment, event.multimedia_comment]);

  const startEdit = () => {
    setDraftEquipment(equipment);
    setDraftGeneralRemark(generalRemark);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftEquipment(equipment);
    setDraftGeneralRemark(generalRemark);
    setIsEditing(false);
  };

  const updateQuantity = (index: number, nextQuantity: number) => {
    setDraftEquipment((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: Math.max(1, nextQuantity) } : item,
      ),
    );
  };

  const updateNote = (index: number, note: string) => {
    setDraftEquipment((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, note } : item)),
    );
  };

  const handleSave = () => {
    if (!canSaveDraft) {
      toast.error("Equipment cannot be edited until the reservation equipment IDs are loaded.");
      return;
    }

    saveEquipment(
      {
        reservationId: event.id,
        equipment: draftEquipment.map((item) => ({
          id: item.id as number,
          quantity: item.quantity,
          note: item.note.trim() || null,
        })),
        multimediaComment: draftGeneralRemark.trim() || null,
      },
      {
        onSuccess: (updatedReservation) => {
          const nextEquipment = normalizeEquipment(updatedReservation.equipment);
          const nextRemark = updatedReservation.multimedia_comment ?? "";

          setEquipment(nextEquipment);
          setDraftEquipment(nextEquipment);
          setGeneralRemark(nextRemark);
          setDraftGeneralRemark(nextRemark);
          setIsEditing(false);
          toast.success("Equipment updated");
        },
      },
    );
  };

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <Package className="text-gray-700 mr-2 h-5 w-5 shrink-0" />
          <h3 className="text-lg font-medium text-gray-700">Equipment</h3>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !canSaveDraft}
                  className="h-9 px-3 inline-flex cursor-pointer items-center gap-2 bg-gray-900 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isPending}
                  className="h-9 px-3 inline-flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={startEdit}
                className="h-9 px-3 inline-flex cursor-pointer items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200" />

      <div className="p-6 space-y-5">
        {displayEquipment.length > 0 ? (
          <div className="space-y-3">
            {displayEquipment.map((item, index) => {
              const itemHasNote = item.note.trim().length > 0;

              return (
                <div
                  key={`${item.id ?? item.name}-${index}`}
                  onClick={canEdit && !isEditing ? startEdit : undefined}
                  onKeyDown={(eventKey) => {
                    if (!canEdit || isEditing) return;
                    if (eventKey.key === "Enter" || eventKey.key === " ") {
                      eventKey.preventDefault();
                      startEdit();
                    }
                  }}
                  role={canEdit && !isEditing ? "button" : undefined}
                  tabIndex={canEdit && !isEditing ? 0 : undefined}
                  className={`w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left ${
                    canEdit && !isEditing ? "cursor-pointer hover:border-gray-300 hover:bg-gray-100" : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      {!isEditing && itemHasNote && canViewRemarks && (
                        <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-gray-600">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <span className="whitespace-pre-wrap">{item.note}</span>
                        </p>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            updateQuantity(index, item.quantity - 1);
                          }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onClick={(eventClick) => eventClick.stopPropagation()}
                          onChange={(eventChange) => updateQuantity(index, Number(eventChange.target.value))}
                          className="h-8 w-16 bg-white px-2 text-center text-sm font-semibold text-gray-800"
                          aria-label={`${item.name} quantity`}
                        />
                        <button
                          type="button"
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            updateQuantity(index, item.quantity + 1);
                          }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-gray-800 ring-1 ring-gray-200">
                        Qty {item.quantity}
                      </span>
                    )}
                  </div>

                  {isEditing && (
                    <Textarea
                      value={item.note}
                      onClick={(eventClick) => eventClick.stopPropagation()}
                      onChange={(eventChange) => updateNote(index, eventChange.target.value)}
                      placeholder={`Note for ${item.name}`}
                      rows={2}
                      maxLength={1000}
                      className="mt-3 min-h-20 resize-none bg-white text-sm text-gray-800"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No equipment selected</p>
        )}

        {remarkSectionVisible && (
          <div className="border-t border-gray-200 pt-5">
            <div className="mb-2 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Equipment Remarks</p>
            </div>

            {isEditing ? (
              <Textarea
                value={draftGeneralRemark}
                onChange={(eventChange) => setDraftGeneralRemark(eventChange.target.value)}
                placeholder="General note for all equipment"
                rows={3}
                maxLength={2000}
                className="min-h-24 resize-none text-sm text-gray-800"
              />
            ) : displayGeneralRemark.trim() ? (
              <p className="whitespace-pre-wrap text-sm leading-5 text-gray-600">{displayGeneralRemark}</p>
            ) : canEdit ? (
              <p className="text-sm text-gray-400">No general equipment remarks yet.</p>
            ) : null}
          </div>
        )}

        {canEdit && status === "PENDING" && !isEditing && hasEquipment && (
          <p className="text-xs text-gray-500">Click an equipment item to adjust quantity or add notes.</p>
        )}
      </div>
    </div>
  );
}
