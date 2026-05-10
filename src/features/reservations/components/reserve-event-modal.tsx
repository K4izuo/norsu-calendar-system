"use client";

import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import { ReserveEventFormTab } from "@/features/reservations/components/reserve-event/tabs/event-form-tab";
import { ReserveEventAdditionalTab } from "@/features/reservations/components/reserve-event/tabs/event-additional-tab";
import { ReserveEventSummaryTab } from "@/features/reservations/components/reserve-event/tabs/event-summary-tab";
import { ReserveEventEquipmentTab } from "@/features/reservations/components/reserve-event/tabs/event-equipment-tab";
import { VpSignatoriesSection } from "@/features/reservations/components/reserve-event/tabs/vp-signatories-section";
import { EventRequestorTab } from "@/features/reservations/components/reserve-event/tabs/event-requestor-tab";
import { AssetsVenueModal } from "@/features/reservations/components/reserve-event/assets/assets-venue-modal";
import { AssetsVehicleModal } from "@/features/reservations/components/reserve-event/assets/assets-vehicle-modal";
import { useAssets } from "@/features/calendar/services/academicDataService";
import { useReserveEventForm } from "@/features/reservations/hooks/useReserveEventForm";
import {
  EventDetails,
  Reservation,
  ReservationAPIPayload,
} from "@/interface/user-props";
import {
  infoTypes,
  categories,
  formattedAssets,
  formatDisplayDate,
} from "./reserve-event/reserve-modal/modal-constants";
import { ModalHeader } from "./reserve-event/reserve-modal/modal-header";
import { ModalTabBar } from "./reserve-event/reserve-modal/modal-tab-bar";
import { ModalFooter } from "./reserve-event/reserve-modal/modal-footer";
import { useModalBehavior } from "@/features/reservations/hooks/useModalBehavior";
import { useModalAssetLoader } from "@/features/reservations/hooks/useModalAssetLoader";
import { useEditModePopulate } from "@/features/reservations/hooks/useEditModePopulate";
import { ReservationSuccessModal } from "@/features/reservations/components/reservation-success-modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationSuccess?: () => void;
  onSubmit?: (data: ReservationAPIPayload) => void;
  eventDate?: string | undefined;
  onNewReservation?: (reservation: Reservation) => void;
  editMode?: boolean;
  resubmitMode?: boolean;
  eventData?: EventDetails;
  userRole?: number;
  userOffice?: { oversight_vp_id: number | null };
}

export function ReserveEventModal({
  isOpen,
  onClose,
  onReservationSuccess,
  onSubmit,
  eventDate,
  onNewReservation,
  editMode = false,
  resubmitMode = false,
  eventData,
  userRole,
  userOffice,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    requestor,
    setRequestor,
    requestorError,
    setRequestorError,
    handleRequestorTabNext,
    handleFormTabNext,
    handleEquipmentTabNext,
    handleAdditionalTabNext,
    equipmentTouched,
    handleFormSubmit,
    setValue,
    setTaggedPeople,
    isCheckingConflict,
    peopleSuggestions,
    showOutsource,
    showGuest,
    guestNameInput,
    guestDetailsInput,
    outsourceError,
    guestNameError,
    guestDetailsError,
    setGuestNameInput,
    setGuestDetailsInput,
    setOutsourceError,
    setGuestNameError,
    setGuestDetailsError,
    handleOutsourceToggle,
    handleGuestToggle,
    handleAddGuest,
    handleRemoveGuest,
    showSuccessModal,
    setShowSuccessModal,
  } = useReserveEventForm({
    eventDate,
    onSubmit,
    onClose,
    onReservationSuccess,
    isOpen,
    onNewReservation,
    editMode,
    resubmitMode,
    eventData,
    userRole,
    userOffice,
  });

  useModalBehavior({ isOpen, onClose });

  React.useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeTab]);

  useEditModePopulate({
    editMode,
    resubmitMode,
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

  // Roles that see the VP signatories section: Dean(1), Admin(3), CampusDirector(5), HeadOfOffice(10)
  const showVpSection = userRole === 1 || userRole === 3 || userRole === 5 || userRole === 10;

  const tabOrder = ["requestor", "form", "equipment", "additional", "summary"];
  const tabLabels: Record<string, string> = {
    requestor: "Requestor",
    form: "Event Details",
    equipment: "Equipment",
    additional: "Additional Info",
    summary: "Summary",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.96 }}
          transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-216 sm:mx-4 mx-px max-h-[92vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: isOpen ? "transform, opacity" : "auto",
            pointerEvents: isOpen ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader
            editMode={editMode}
            displayDate={displayDate}
            onClose={onClose}
          />

          <form className="flex flex-col flex-1" onSubmit={handleFormSubmit}>
            <div ref={scrollRef} className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
              <Tabs value={activeTab} className="w-full">
                <ModalTabBar
                  tabOrder={tabOrder}
                  tabLabels={tabLabels}
                  activeTab={activeTab}
                />

                <TabsContent value="requestor" className="space-y-4 sm:space-y-6">
                  <EventRequestorTab
                    requestor={requestor}
                    onChange={setRequestor}
                    error={requestorError}
                    onClearError={setRequestorError}
                  />
                </TabsContent>

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

                <TabsContent value="equipment" className="space-y-4 sm:space-y-6">
                  <ReserveEventEquipmentTab watch={watch} setValue={setValue} touched={equipmentTouched} />
                </TabsContent>

                <TabsContent
                  value="additional"
                  className="space-y-5"
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
                    showOutsource={showOutsource}
                    showGuest={showGuest}
                    guestNameInput={guestNameInput}
                    guestDetailsInput={guestDetailsInput}
                    outsourceError={outsourceError}
                    guestNameError={guestNameError}
                    guestDetailsError={guestDetailsError}
                    setGuestNameInput={setGuestNameInput}
                    setGuestDetailsInput={setGuestDetailsInput}
                    setOutsourceError={setOutsourceError}
                    setGuestNameError={setGuestNameError}
                    setGuestDetailsError={setGuestDetailsError}
                    handleOutsourceToggle={handleOutsourceToggle}
                    handleGuestToggle={handleGuestToggle}
                    handleAddGuest={handleAddGuest}
                    handleRemoveGuest={handleRemoveGuest}
                  />

                  {showVpSection && (
                    <VpSignatoriesSection
                      watch={watch}
                      setValue={setValue}
                      register={register}
                      studentInvolvementLocked={requestor?.type === "student"}
                    />
                  )}
                </TabsContent>

                <TabsContent value="summary" className="space-y-4 sm:space-y-6">
                  <ReserveEventSummaryTab
                    formData={getValues()}
                    categories={categories}
                    infoTypes={infoTypes}
                    taggedPeople={taggedPeople}
                    requestorInfo={requestor}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <ModalFooter
              activeTab={activeTab}
              isSubmitting={isSubmitting}
              isCheckingConflict={isCheckingConflict}
              editMode={editMode}
              resubmitMode={resubmitMode}
              setActiveTab={setActiveTab}
              handleRequestorTabNext={handleRequestorTabNext}
              handleFormTabNext={handleFormTabNext}
              handleEquipmentTabNext={handleEquipmentTabNext}
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

      <ReservationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}
