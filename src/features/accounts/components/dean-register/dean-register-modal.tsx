"use client";

import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { GraduationCap, X, ArrowLeft, ArrowRight, SendHorizontal } from "lucide-react";
import { useCampuses, useOffices } from "@/features/calendar/services/academicDataService";
import { DeanFormInput } from "@/features/auth/components/register/dean/dean-input-field";
import { DeanFormSelectField } from "@/features/auth/components/register/dean/dean-select-field";
import { DeanSummary } from "@/features/auth/components/register/dean/dean-summary";
import { deanSchema, deanWithCredentialsSchema, DeanWithCredentialsFormData } from "@/features/auth/utils/dean/dean-register-validation-rules";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldValidation } from "@/features/auth/utils/dean/dean-register-field-validation";
import { apiClient } from "@/core/api/api-client";
import { useModalBehavior } from "@/features/reservations/hooks/useModalBehavior";
import toast from "react-hot-toast";

interface DeanRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { value: "details", label: "Dean Details" },
  { value: "credentials", label: "Credentials" },
  { value: "summary", label: "Summary" },
] as const;

export function DeanRegisterModal({ isOpen, onClose }: DeanRegisterModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "credentials" | "summary">("details");
  const [agreed, setAgreed] = useState(false);

  const { campuses, loading: loadingCampuses, error: campusError } = useCampuses();
  const { offices, loading: loadingOffices, error: officeError } = useOffices();

  const { control, handleSubmit, watch, register, reset, trigger, setValue, getValues, formState: { errors, isSubmitting, isValid } } =
    useForm<DeanWithCredentialsFormData>({
      resolver: zodResolver(deanWithCredentialsSchema),
      mode: "onTouched",
      defaultValues: {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        assignment_id: "",
        campus_id: "",
        office_id: "",
        role: "",
        username: "",
        password: "",
        confirmPassword: "",
      },
    });

  const formData = watch();

  const firstNameError = useFieldValidation(formData.first_name, deanSchema.shape.first_name);
  const middleNameError = useFieldValidation(formData.middle_name, deanSchema.shape.middle_name);
  const lastNameError = useFieldValidation(formData.last_name, deanSchema.shape.last_name);
  const emailError = useFieldValidation(formData.email, deanSchema.shape.email);
  const deanIDError = useFieldValidation(formData.assignment_id, deanSchema.shape.assignment_id);

  useModalBehavior({ isOpen, onClose });

  const onSubmit = useCallback(
    async (data: DeanWithCredentialsFormData) => {
      try {
        const response = await apiClient.post<{ role?: number }, object>(
          "users/store",
          {
            first_name: data.first_name,
            middle_name: data.middle_name,
            last_name: data.last_name,
            email: data.email,
            assignment_id: data.assignment_id,
            campus_id: data.campus_id,
            office_id: data.office_id,
            username: data.username,
            password: data.password,
            role: "dean",
          }
        );
        if (response.error) {
          const errorMessage =
            response.error.toLowerCase().includes("email") && response.error.toLowerCase().includes("already")
              ? "Email is already registered."
              : response.error;
          toast.error(errorMessage, { duration: 5000 });
          return;
        }
        toast.success("Dean registration successful!", { duration: 5000 });
        reset();
        setActiveTab("details");
        setAgreed(false);
        onClose();
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed!", { duration: 5000 });
      }
    },
    [reset, onClose]
  );

  const handleNext = useCallback(async () => {
    const fields = ["first_name", "middle_name", "last_name", "email", "assignment_id", "campus_id", "office_id"] as const;
    const valid = await trigger([...fields]);
    if (!valid) {
      fields.forEach((field) => setValue(field, getValues(field), { shouldTouch: true, shouldValidate: false }));
      return;
    }
    setActiveTab("credentials");
  }, [trigger, setValue, getValues]);

  const handleCredentialsNext = useCallback(async () => {
    const fields = ["username", "password", "confirmPassword"] as const;
    const valid = await trigger([...fields]);
    if (!valid) {
      fields.forEach((field) => setValue(field, getValues(field), { shouldTouch: true, shouldValidate: false }));
      return;
    }
    setActiveTab("summary");
  }, [trigger, setValue, getValues]);

  const handleClose = useCallback(() => {
    reset();
    setActiveTab("details");
    setAgreed(false);
    onClose();
  }, [reset, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleClose}
      />

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 8 }}
        transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-216 sm:mx-4 mx-px max-h-[92vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          transformOrigin: "center",
          willChange: "transform, opacity",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <GraduationCap strokeWidth={2.5} className="w-8 h-8 text-gray-800 shrink-0" />
              <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
                Create Dean Account
              </h2>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              size="sm"
              className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form className="flex flex-col flex-1" onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
            <Tabs value={activeTab} className="w-full">
              {/* Tab bar */}
              <div className="grid grid-cols-3 mb-4 sm:mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
                {TABS.map((tab) => (
                  <div
                    key={tab.value}
                    className={`flex items-center justify-center py-2 px-2 sm:py-2.5 sm:px-4 rounded-md text-base font-medium transition-colors ${activeTab === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                      }`}
                    style={{ cursor: "default", minWidth: "100px" }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              {/* Details tab */}
              <TabsContent value="details" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <DeanFormInput
                    name="first_name"
                    label="First Name"
                    register={register}
                    errors={errors}
                    clientError={firstNameError}
                    autoComplete="given-name"
                    placeholder="Enter first name"
                  />
                  <DeanFormInput
                    name="middle_name"
                    label="Middle Name"
                    register={register}
                    errors={errors}
                    clientError={middleNameError}
                    autoComplete="additional-name"
                    placeholder="Enter middle name"
                  />
                  <DeanFormInput
                    name="last_name"
                    label="Last Name"
                    register={register}
                    errors={errors}
                    clientError={lastNameError}
                    autoComplete="family-name"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <DeanFormInput
                    name="email"
                    label="Email"
                    register={register}
                    errors={errors}
                    clientError={emailError}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email"
                  />
                  <DeanFormInput
                    name="assignment_id"
                    label="Dean ID"
                    register={register}
                    errors={errors}
                    clientError={deanIDError}
                    autoComplete="off"
                    placeholder="Enter dean ID"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Controller
                      name="campus_id"
                      control={control}
                      render={({ field }) => (
                        <DeanFormSelectField
                          id="campus_id"
                          name="campus_id"
                          label="Campus"
                          placeholder="Select campus"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={campuses}
                          loading={loadingCampuses}
                          error={campusError}
                          required
                          hasError={!!errors.campus_id}
                          validationError={errors.campus_id?.message as string}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Controller
                      name="office_id"
                      control={control}
                      render={({ field }) => (
                        <DeanFormSelectField
                          id="office_id"
                          name="office_id"
                          label="Office"
                          placeholder="Select office"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={offices}
                          loading={loadingOffices}
                          error={officeError}
                          required
                          hasError={!!errors.office_id}
                          validationError={errors.office_id?.message as string}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Credentials tab */}
              <TabsContent value="credentials" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3">
                  <DeanFormInput
                    name="username"
                    label="Username"
                    register={register}
                    errors={errors}
                    autoComplete="username"
                    placeholder="Enter username"
                  />
                  <DeanFormInput
                    name="password"
                    label="Password"
                    register={register}
                    errors={errors}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter password"
                  />
                  <DeanFormInput
                    name="confirmPassword"
                    label="Confirm Password"
                    register={register}
                    errors={errors}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                  />
                </div>
              </TabsContent>

              {/* Summary tab */}
              <TabsContent value="summary" className="space-y-4 sm:space-y-6">
                <DeanSummary
                  formData={{ ...formData, role: "dean" }}
                  campuses={campuses}
                  offices={offices}
                  isFormValid={isValid}
                  agreed={agreed}
                  setAgreed={setAgreed}
                  color="indigo"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-end">
            {activeTab === "details" && (
              <Button
                type="button"
                onClick={handleNext}
                variant="default"
                className="text-base cursor-pointer py-2.5"
              >
                <div className="flex items-center">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Button>
            )}
            {activeTab === "credentials" && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  variant="outline"
                  className="text-base cursor-pointer py-2.5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleCredentialsNext}
                  variant="default"
                  className="text-base cursor-pointer py-2.5"
                >
                  <div className="flex items-center">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Button>
              </div>
            )}
            {activeTab === "summary" && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveTab("credentials")}
                  variant="outline"
                  className="text-base cursor-pointer py-2.5"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={!isValid || isSubmitting || !agreed}
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
                    <div className="flex items-center">
                      Submit Registration
                      <SendHorizontal className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
