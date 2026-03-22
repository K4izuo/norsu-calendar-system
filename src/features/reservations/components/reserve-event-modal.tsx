"use client";

import React, { useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import { ReserveEventFormTab } from "@/features/reservations/components/reserve-event/tabs/event-form-tab";
import { ReserveEventAdditionalTab } from "@/features/reservations/components/reserve-event/tabs/event-additional-tab";
import { ReserveEventSummaryTab } from "@/features/reservations/components/reserve-event/tabs/event-summary-tab";
import { AssetsVenueModal } from "@/features/reservations/components/reserve-event/assets/assets-venue-modal";
import { AssetsVehicleModal } from "@/features/reservations/components/reserve-event/assets/assets-vehicle-modal";
import { useAssets } from "@/features/calendar/services/academicDataService";
import { useReserveEventForm } from "@/features/reservations/hooks/useReserveEventForm";
import {
  Reservation,
  ReservationAPIPayload,
} from "@/features/reservations/types/reservation.types";
import { EventDetails } from "@/features/calendar/types/calendar.types";
import {
  infoTypes,
  categories,
  peopleSuggestions,
  formattedAssets,
  formatDisplayDate,
} from "./reserve-event/modal/modal-constants";
import { ModalHeader } from "./reserve-event/modal/modal-header";
import { ModalTabBar } from "./reserve-event/modal/modal-tab-bar";
import { ModalFooter } from "./reserve-event/modal/modal-footer";
import { useModalBehavior } from "@/features/reservations/hooks/useModalBehavior";
import { useModalAssetLoader } from "@/features/reservations/hooks/useModalAssetLoader";
import { useEditModePopulate } from "@/features/reservations/hooks/useEditModePopulate";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ReservationAPIPayload) => void;
  eventDate?: string | undefined;
  onNewReservation?: (reservation: Reservation) => void;
  editMode?: boolean;
  eventData?: EventDetails;
}

export function ReserveEventModal({
  isOpen,
  onClose,
  onSubmit,
  eventDate,
  onNewReservation,
  editMode = false,
  eventData,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const { assets } = useAssets();

  const {
    control,
    errors,
    isSubmitting,
    register,
    watch,
    activeTab,
    setActiveTab,
    showVenueModal,
    setShowVenueModal,
    showVehicleModal,
    setShowVehicleModal,
    tagInput,
    taggedPeople,
    showDropdown,
    setShowDropdown,
    peopleFieldRef,
    watchedAsset,
    getValues,
    handleAssetChange,
    handleAssetItemSelect,
    handleTagInputChange,
    handleTagSelect,
    handleRemoveTag,
    isFormValid,
    handleFormTabNext,
    handleAdditionalTabNext,
    handleFormSubmit,
    setValue,
    setTaggedPeople,
    isCheckingConflict, // ✅ NEW: Destructure loading state
  } = useReserveEventForm({
    eventDate,
    onSubmit,
    onClose,
    isOpen,
    onNewReservation,
    editMode,
    eventData,
  });

  useModalBehavior({ isOpen, onClose });
  useEditModePopulate({
    editMode,
    eventData,
    isOpen,
    setValue,
    setTaggedPeople,
  });
  const {
    loadingVenueAssets,
    loadingVehicleAssets,
    venueAssets,
    vehicleAssets,
  } = useModalAssetLoader({
    showVenueModal,
    showVehicleModal,
    assets,
  });

  const displayDate = useMemo(() => formatDisplayDate(eventDate), [eventDate]);

  const tabOrder = ["form", "additional", "summary"];
  const tabLabels: Record<string, string> = {
    form: "Event Details",
    additional: "Additional Info",
    summary: "Summary",
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            type: "tween",
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative w-full max-w-216 sm:mx-4 mx-px max-h-[92vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader
            editMode={editMode}
            displayDate={displayDate}
            onClose={onClose}
          />

          <form className="flex flex-col flex-1" onSubmit={handleFormSubmit}>
            <div className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
              <Tabs value={activeTab} className="w-full">
                <ModalTabBar
                  tabOrder={tabOrder}
                  tabLabels={tabLabels}
                  activeTab={activeTab}
                />

                <TabsContent value="form" className="space-y-4 sm:space-y-6">
                  <ReserveEventFormTab
                    control={control}
                    errors={errors}
                    assets={formattedAssets}
                    handleAssetChange={handleAssetChange}
                    selectedAsset={watchedAsset}
                    register={register}
                    watch={watch}
                  />
                </TabsContent>

                <TabsContent
                  value="additional"
                  className="space-y-4 sm:space-y-6"
                >
                  <ReserveEventAdditionalTab
                    control={control}
                    errors={errors}
                    infoTypes={infoTypes}
                    categories={categories}
                    tagInput={tagInput}
                    taggedPeople={taggedPeople}
                    peopleSuggestions={peopleSuggestions}
                    showDropdown={showDropdown}
                    handleTagInputChange={handleTagInputChange}
                    handleTagSelect={handleTagSelect}
                    handleRemoveTag={handleRemoveTag}
                    setShowDropdown={setShowDropdown}
                    peopleFieldRef={peopleFieldRef}
                  />
                </TabsContent>

                <TabsContent value="summary" className="space-y-4 sm:space-y-6">
                  <ReserveEventSummaryTab
                    formData={getValues()}
                    categories={categories}
                    infoTypes={infoTypes}
                    taggedPeople={taggedPeople}
                    isFormValid={isFormValid}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <ModalFooter
              activeTab={activeTab}
              isSubmitting={isSubmitting}
              isCheckingConflict={isCheckingConflict}
              editMode={editMode}
              setActiveTab={setActiveTab}
              handleFormTabNext={handleFormTabNext}
              handleAdditionalTabNext={handleAdditionalTabNext}
            />
          </form>
        </motion.div>

        <AssetsVenueModal
          isOpen={showVenueModal}
          onClose={() => setShowVenueModal(false)}
          assets={venueAssets}
          onAssetSelect={handleAssetItemSelect}
          loading={loadingVenueAssets}
          role="admin"
        />

        <AssetsVehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          assets={vehicleAssets}
          onAssetSelect={handleAssetItemSelect}
          loading={loadingVehicleAssets}
          role="admin"
        />
      </div>
    </AnimatePresence>
  );
}
