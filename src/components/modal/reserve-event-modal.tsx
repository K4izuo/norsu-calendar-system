"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
// import { Label } from "@/components/ui/label"
import toast from "react-hot-toast" // Import toast
import { ReserveEventFormTab } from "@/components/modal/reserve-event-tab/event-form-tab"
import { ReserveEventAdditionalTab } from "@/components/modal/reserve-event-tab/event-additional-tab"
import { ReserveEventSummaryTab } from "@/components/modal/reserve-event-tab/event-summary-tab"
import { ReservationFormData } from "@/interface/faculty-events-props"
import { AssetsVenueModal } from "@/components/modal/reserve-event-assets/AssetsVenueModal";
import { AssetsVehicleModal } from "@/components/modal/reserve-event-assets/AssetsVehicleModal";
import { CalendarClock } from "lucide-react"

// Add these sample options above your component
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
  eventDate?: string | undefined // <-- should be string | undefined
}

// 1. Update ReservationFormData asset type to allow storing the full asset object or null
// (You may want to update your interface/faculty-events-props.ts as well)
type AssetType = {
  id: string;
  name: string;
  capacity: string;
  facilities?: string[];
} | null;

export function ReserveEventModal({ isOpen, onClose, onSubmit, eventDate }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<string>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  // 2. Update formData to store the selected asset object
  const [formData, setFormData] = useState<ReservationFormData>({
    title: "",
    asset: null, // <-- will store the selected asset object
    timeStart: "",
    timeEnd: "",
    description: "",
    range: 1,
    people: "",
    infoType: "",
    category: "",
    // No date field yet
  })

  // Add date to formData when eventDate changes
  useEffect(() => {
    if (eventDate) {
      setFormData(prev => ({
        ...prev,
        date: eventDate
      }))
    }
  }, [eventDate])

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

  // Add this effect to reset the activeTab when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset to form tab whenever the modal opens
      setActiveTab("form")
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMissingFields(prev => {
      if (prev[name]) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }
      return prev;
    });
  }

  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Add loading states for assets
  const [loadingVenueAssets, setLoadingVenueAssets] = useState(false);
  const [loadingVehicleAssets, setLoadingVehicleAssets] = useState(false);

  // Example asset data (replace with real API call if needed)
  const [venueAssets, setVenueAssets] = useState<{ id: string; name: string; capacity: string }[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<{ id: string; name: string; capacity: string }[]>([]);

  // Simulate loading assets when opening modals
  useEffect(() => {
    if (showVenueModal) {
      setLoadingVenueAssets(true);
      setTimeout(() => {
        setVenueAssets([
          { id: "a1", name: "Main Building, Room 101", capacity: "120 seats" },
          { id: "a2", name: "Science Building, Room 203", capacity: "80 seats" },
        ]);
        setLoadingVenueAssets(false);
      }, 1000); // simulate loading
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
      }, 1000); // simulate loading
    }
  }, [showVehicleModal]);

  // 3. Update handleAssetChange to only open the modal, not set asset directly
  const handleAssetChange = (value: string) => {
    // Only open the modal, don't set asset here
    if (value === "assets venue") setShowVenueModal(true);
    if (value === "assets vehicle") setShowVehicleModal(true);
  };

  // 4. When an asset is selected in the modal, set it in formData and close the modal
  const handleAssetItemSelect = (asset: { id: string; name: string; capacity: string }) => {
    setFormData(prev => ({
      ...prev,
      asset // store the full asset object
    }));
    setMissingFields(prev => {
      if (prev.asset) {
        const updated = { ...prev };
        delete updated.asset;
        return updated;
      }
      return prev;
    });
    setShowVenueModal(false);
    setShowVehicleModal(false);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, range: Number(e.target.value) }))
    setMissingFields(prev => {
      if (prev.range) {
        const updated = { ...prev };
        delete updated.range;
        return updated;
      }
      return prev;
    });
  }

  const handleInfoTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, infoType: value }))
    setMissingFields(prev => {
      if (prev.infoType) {
        const updated = { ...prev };
        delete updated.infoType;
        return updated;
      }
      return prev;
    });
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
    setMissingFields(prev => {
      if (prev.category) {
        const updated = { ...prev };
        delete updated.category;
        return updated;
      }
      return prev;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      toast.error("Please complete all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Show loading toast while submitting
      const toastId = toast.loading("Submitting reservation...");
      
      // Simulate API call delay (remove this in production)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSubmit) {
        // Pass the toast ID to the parent component so it can update the toast if needed
        // or just call onSubmit without showing our own success toast
        onSubmit(formData);
      }
      
      // Update toast to success
      toast.success("Event reserved successfully!", { id: toastId });
      
      // Reset form and close modal
      setFormData({
        title: "",
        asset: null,
        timeStart: "",
        timeEnd: "",
        description: "",
        range: 1, // Reset range to default
        people: "",
        infoType: "",
        category: "",
      });

      setTaggedPeople([]);
      setTagInput("");
      
      // Wait a bit to show success message before closing
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch {
      // Show error toast
      toast.error("Failed to reserve event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" && 
      formData.asset !== null && 
      formData.timeStart !== "" && 
      formData.timeEnd !== ""
    )
  }

  // Function to show form validation toast
  const checkFormFields = () => {
    const missingObj: Record<string, boolean> = {};
    if (!formData.title.trim()) missingObj.title = true;
    if (!formData.asset) missingObj.asset = true;
    if (!formData.timeStart) missingObj.timeStart = true;
    if (!formData.timeEnd) missingObj.timeEnd = true;
    if (formData.timeStart && formData.timeEnd && formData.timeStart >= formData.timeEnd) missingObj.timeEnd = true;
    if (!formData.description.trim()) missingObj.description = true;
    if (!formData.range) missingObj.range = true;

    setMissingFields(missingObj);

    if (Object.keys(missingObj).length > 0) {
      Object.keys(missingObj).forEach((field, i) => {
        setTimeout(() => {
          toast.error(`Missing: ${field}`);
        }, i * 200);
      });
      return false;
    }
    return true;
  };

  // Validate additional tab fields
  const validateAdditionalTab = () => {
    const missingObj: Record<string, boolean> = {};
    if (taggedPeople.length === 0) missingObj.people = true; // <-- use taggedPeople
    if (!formData.infoType) missingObj.infoType = true;
    if (!formData.category) missingObj.category = true;

    setMissingFields(prev => ({ ...prev, ...missingObj }));

    if (Object.keys(missingObj).length > 0) {
      Object.keys(missingObj).forEach((field, i) => {
        setTimeout(() => {
          toast.error(`Missing: ${field}`);
        }, i * 200);
      });
      return false;
    }
    return true;
  };

  // Define tab order and labels
  const tabOrder = ["form", "additional", "summary"];
  const tabLabels: Record<string, string> = {
    form: "Event Details",
    additional: "Additional Info",
    summary: "Summary",
  };

  // Sample people suggestions
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
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (taggedPeople.length > 0 && missingFields.people) {
      setMissingFields(prev => {
        const updated = { ...prev };
        delete updated.people;
        return updated;
      });
    }
  }, [taggedPeople, missingFields.people]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
          onClick={onClose}
        >
          {/* Animated backdrop */}
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

          {/* Modal content */}
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
            {/* Header with title and close button */}
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

            {/* Tabs and content */}
            <div className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
              <Tabs value={activeTab} className="w-full">
                {/* Tabs header: allow horizontal scroll on mobile */}
                <div className="grid grid-cols-3 mb-4 sm:mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
                  {tabOrder.map(tab => (
                    <div
                      key={tab}
                      className={`flex items-center justify-center py-2 px-2 sm:py-2.5 sm:px-4 rounded-md text-base font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                      style={{ cursor: "default", minWidth: "100px" }}
                    >
                      {tabLabels[tab]}
                    </div>
                  ))}
                </div>

                {/* Form Tab */}
                <TabsContent value="form" className="space-y-4 sm:space-y-6">
                  <ReserveEventFormTab
                    formData={formData}
                    assets={[
                      { id: "assets venue", name: "Assets Venue", capacity: "" },
                      { id: "assets vehicle", name: "Assets Vehicle", capacity: "" }
                    ]}
                    handleInputChange={handleInputChange}
                    handleAssetChange={handleAssetChange}
                    handleRangeChange={handleRangeChange}
                    missingFields={missingFields}
                    selectedAsset={formData.asset} // <-- pass selected asset
                  />
                </TabsContent>

                {/* Additional Info Tab */}
                <TabsContent value="additional" className="space-y-4 sm:space-y-6">
                  <ReserveEventAdditionalTab
                    formData={formData}
                    infoTypes={infoTypes}
                    categories={categories}
                    tagInput={tagInput}
                    taggedPeople={taggedPeople}
                    peopleSuggestions={peopleSuggestions}
                    showDropdown={showDropdown}
                    handleTagInputChange={handleTagInputChange}
                    handleTagSelect={handleTagSelect}
                    handleRemoveTag={handleRemoveTag}
                    handleInfoTypeChange={handleInfoTypeChange}
                    handleCategoryChange={handleCategoryChange}
                    setShowDropdown={setShowDropdown}
                    missingFields={missingFields} // <-- add this line
                  />
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4 sm:space-y-6 pb-4">
                  <ReserveEventSummaryTab
                    formData={formData}
                    categories={categories}
                    infoTypes={infoTypes}
                    taggedPeople={taggedPeople}
                    isFormValid={isFormValid}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky footer navigation */}
            <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-5 border-t border-gray-100 flex justify-end">
              {activeTab === "form" && (
                <Button
                  type="button"
                  onClick={() => {
                    if (checkFormFields()) setActiveTab("additional");
                  }}
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
                    onClick={async () => {
                      if (await validateAdditionalTab()) setActiveTab("summary");
                    }}
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
                    type="button"
                    onClick={handleSubmit}
                    variant="default"
                    disabled={!isFormValid() || isSubmitting}
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
          </motion.div>

          {/* Place these modals outside your main modal content */}
          <AssetsVenueModal
            isOpen={showVenueModal}
            onClose={() => setShowVenueModal(false)}
            assets={venueAssets}
            onAssetSelect={handleAssetItemSelect}
            loading={loadingVenueAssets} // pass loading state
          />

          <AssetsVehicleModal
            isOpen={showVehicleModal}
            onClose={() => setShowVehicleModal(false)}
            assets={vehicleAssets}
            onAssetSelect={handleAssetItemSelect}
            loading={loadingVehicleAssets} // pass loading state
          />
        </div>
      )}
    </AnimatePresence>
  )
}