"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { ReserveEventFormTab } from "@/components/modal/reserve-event-tab/event-form-tab"
import { ReserveEventAdditionalTab } from "@/components/modal/reserve-event-tab/event-additional-tab"
import { ReserveEventSummaryTab } from "@/components/modal/reserve-event-tab/event-summary-tab"
import { ReservationFormData } from "@/interface/user-props"
import { AssetsVenueModal } from "@/components/modal/reserve-event-assets/assets-venue-modal"
import { AssetsVehicleModal } from "@/components/modal/reserve-event-assets/assets-vehicle-modal"
import { showFormTabErrorToast, showAdditionalTabErrorToast } from "@/utils/reserve-event/reservation-field-error-toast"
import { RESERVATION_VALIDATION_RULES } from "@/utils/reserve-event/reservation-validation-rules"

const infoTypes = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "restricted", label: "Restricted" },
]

const categories = [
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
]

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: ReservationFormData) => void
  eventDate?: string | undefined
}

export function ReserveEventModal({ isOpen, onClose, onSubmit, eventDate }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<string>("form")
  const peopleFieldRef = useRef<HTMLInputElement>(null)

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const form = useForm<ReservationFormData>({
    mode: "onTouched",
    defaultValues: {
      title: "",
      asset: null,
      timeStart: getCurrentTime(),
      timeEnd: getCurrentTime(),
      description: "",
      range: 1,
      people: "",
      infoType: "",
      category: "",
      date: eventDate || "",
    },
  });

  const { control, handleSubmit, setValue, getValues, watch, register, trigger, formState: { errors, isSubmitting }, reset } = form;

  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [loadingVenueAssets, setLoadingVenueAssets] = useState(false);
  const [loadingVehicleAssets, setLoadingVehicleAssets] = useState(false);
  const [venueAssets, setVenueAssets] = useState<{ id: string; name: string; capacity: string }[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<{ id: string; name: string; capacity: string }[]>([]);

  const peopleSuggestions = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Alice Johnson" },
    { id: "4", name: "Bob Lee" },
    { id: "5", name: "Maria Garcia" },
  ];

  const [tagInput, setTagInput] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (eventDate) {
      setValue("date", eventDate);
    }
  }, [eventDate, setValue]);

  useEffect(() => {
    if (isOpen) {
      const currentTime = getCurrentTime();
      setValue("timeStart", currentTime);
      setValue("timeEnd", currentTime);
    }
  }, [isOpen, setValue]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setActiveTab("form")
    }
  }, [isOpen])

  useEffect(() => {
    if (showVenueModal) {
      setLoadingVenueAssets(true);
      setTimeout(() => {
        setVenueAssets([
          { id: "a1", name: "Main Building, Room 101", capacity: "120 seats" },
          { id: "a2", name: "Science Building, Room 203", capacity: "80 seats" },
        ]);
        setLoadingVenueAssets(false);
      }, 1000);
    }
  }, [showVenueModal]);

  useEffect(() => {
    if (showVehicleModal) {
      setLoadingVehicleAssets(true);
      setTimeout(() => {
        setVehicleAssets([
          { id: "v1", name: "School Bus", capacity: "50 seats" },
          { id: "v2", name: "Van", capacity: "15 seats" },
        ]);
        setLoadingVehicleAssets(false);
      }, 1000);
    }
  }, [showVehicleModal]);

  // Update the useEffect for people sync
  useEffect(() => {
    const peopleValue = taggedPeople.map(p => p.name).join(', ');
    setValue("people", peopleValue, { 
      shouldDirty: taggedPeople.length > 0,
      shouldValidate: true,
      shouldTouch: true
    });
  }, [taggedPeople, setValue]);

  const handleAssetChange = (value: string) => {
    if (value === "assets venue") setShowVenueModal(true);
    if (value === "assets vehicle") setShowVehicleModal(true);
  };

  const handleAssetItemSelect = (asset: { id: string; name: string; capacity: string }) => {
    setValue("asset", asset, { shouldValidate: true, shouldTouch: true });
    setShowVenueModal(false);
    setShowVehicleModal(false);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const handleTagSelect = (person: { id: string; name: string }) => {
    if (!taggedPeople.some(p => p.id === person.id)) {
      setTaggedPeople([...taggedPeople, person]);
      setTagInput("");
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (id: string) => {
    setTaggedPeople(taggedPeople.filter(p => p.id !== id));
  };

  const isFormValid = useCallback((): boolean => {
    const values = getValues();
    return Boolean(
      values.title &&
      values.asset &&
      values.timeStart &&
      values.timeEnd &&
      values.timeEnd > values.timeStart &&
      values.description &&
      values.range &&
      values.infoType &&
      values.category &&
      taggedPeople.length > 0
    );
  }, [getValues, taggedPeople.length]);

  const onSubmitForm = useCallback(
    async (data: ReservationFormData) => {
      try {
        const formDataWithPeople = {
          ...data,
          people: taggedPeople.map(p => p.name).join(', '),
        };

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (onSubmit) {
          onSubmit(formDataWithPeople);
        }

        toast.success("Event reserved successfully!");

        reset();
        setTaggedPeople([]);
        setTagInput("");

        setTimeout(() => {
          onClose();
        }, 1000);

      } catch (error) {
        console.error("Reservation error:", error);
        toast.error("Failed to reserve event. Please try again.");
      }
    },
    [onSubmit, reset, onClose, taggedPeople]
  );

  const handleFormTabNext = useCallback(() => {
    handleSubmit(
      () => setActiveTab("additional"),
      (errors) => showFormTabErrorToast(errors, getValues())
    )();
  }, [handleSubmit, getValues]);

  const handleAdditionalTabNext = useCallback(async () => {
    // Set people value for validation
    setValue("people", taggedPeople.map(p => p.name).join(', '), { 
      shouldValidate: true, 
      shouldTouch: true 
    });

    const isValid = await trigger(['people', 'infoType', 'category']);
    
    if (isValid && taggedPeople.length > 0) {
      setActiveTab("summary");
    } else {
      if (taggedPeople.length === 0) {
        setValue("people", "", { shouldValidate: true, shouldTouch: true });
        setTimeout(() => peopleFieldRef.current?.focus(), 100);
      }
      showAdditionalTabErrorToast(errors, getValues(), taggedPeople);
    }
  }, [trigger, getValues, taggedPeople, setValue, errors]);

  const tabOrder = ["form", "additional", "summary"];
  const tabLabels: Record<string, string> = {
    form: "Event Details",
    additional: "Additional Info",
    summary: "Summary",
  };

  const watchedAsset = watch("asset");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1]
          }}
        />

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            type: "tween",
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative w-full max-w-[900px] sm:mx-4 mx-[1px] max-h-[92vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Reserve Event
              </h2>
              <Button
                onClick={e => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-500" />
              </Button>
            </div>
          </div>

          <form className="flex flex-col flex-1" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
              <Tabs value={activeTab} className="w-full">
                <div className="grid grid-cols-3 mb-4 sm:mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
                  {tabOrder.map(tab => (
                    <div
                      key={tab}
                      className={`flex items-center justify-center py-2 px-2 sm:py-2.5 sm:px-4 rounded-md text-base font-medium transition-colors ${activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                        }`}
                      style={{ cursor: "default", minWidth: "100px" }}
                    >
                      {tabLabels[tab]}
                    </div>
                  ))}
                </div>

                <TabsContent value="form" className="space-y-4 sm:space-y-6">
                  <ReserveEventFormTab
                    control={control}
                    errors={errors}
                    assets={[
                      { id: "assets venue", name: "Assets Venue", capacity: "" },
                      { id: "assets vehicle", name: "Assets Vehicle", capacity: "" }
                    ]}
                    handleAssetChange={handleAssetChange}
                    selectedAsset={watchedAsset}
                    validationRules={RESERVATION_VALIDATION_RULES}
                    register={register}
                  />
                </TabsContent>

                <TabsContent value="additional" className="space-y-4 sm:space-y-6">
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
                    validationRules={RESERVATION_VALIDATION_RULES}
                    register={register}
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

            <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-end">
              {activeTab === "form" && (
                <Button
                  type="button"
                  onClick={handleFormTabNext}
                  variant="default"
                  className="text-base cursor-pointer py-2.5"
                >
                  Next
                </Button>
              )}
              {activeTab === "additional" && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    variant="outline"
                    className="text-base cursor-pointer py-2.5"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAdditionalTabNext}
                    variant="default"
                    className="text-base cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              )}
              {activeTab === "summary" && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("additional")}
                    variant="outline"
                    className="text-base cursor-pointer py-2.5"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSubmitting}
                    className="text-base cursor-pointer py-2.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </span>
                        Processing...
                      </div>
                    ) : (
                      "Submit Reservation"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </motion.div>

        <AssetsVenueModal
          isOpen={showVenueModal}
          onClose={() => setShowVenueModal(false)}
          assets={venueAssets}
          onAssetSelect={handleAssetItemSelect}
          loading={loadingVenueAssets}
        />

        <AssetsVehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          assets={vehicleAssets}
          onAssetSelect={handleAssetItemSelect}
          loading={loadingVehicleAssets}
        />
      </div>
    </AnimatePresence>
  )
}