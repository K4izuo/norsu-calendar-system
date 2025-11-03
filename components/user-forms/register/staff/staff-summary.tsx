import React, { memo, useState } from "react";
import { User } from "lucide-react";
import { StaffRegisterFormData } from "@/interface/user-props";
import { OptionType } from "@/services/academicDataService";
import { TermsAndConditionModal } from "@/components/privacy/terms-and-condition-modal";
import { Checkbox } from "@/components/ui/checkbox";

type StaffSummaryProps = {
  formData: StaffRegisterFormData;
  campuses: OptionType[];
  offices: OptionType[];
  isFormValid: boolean;
  agreed: boolean;
  setAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  color?: "emerald" | "indigo" | "red";
};

export const StaffSummary = memo(function StaffSummary({
  formData,
  campuses,
  offices,
  isFormValid,
  agreed,
  setAgreed,
  color = "red",
}: StaffSummaryProps) {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <User className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Staff Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Full Name</p>
            <p className="font-medium text-base">
              {`${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim() || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Email</p>
            <p className="font-medium text-base">{formData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Staff ID</p>
            <p className="font-medium text-base">{formData.assignment_id || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Campus</p>
            <p className="font-medium text-base">
              {campuses.find((c) => c.value === formData.campus_id)?.label || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Office</p>
            <p className="font-medium text-base">
              {offices.find((o) => o.value === formData.office_id)?.label || "Not selected"}
            </p>
          </div>
        </div>
        {/* Terms and Condition Checkbox */}
        <div className="mt-6 flex items-center">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => {
              if (!checked) {
                setAgreed(false);
              } else if (!agreed) {
                setTermsOpen(true);
              }
            }}
            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 cursor-pointer"
          />
          <span
            className="ml-3 text-base text-gray-700 cursor-pointer select-none"
            onClick={() => setTermsOpen(true)}
          >
            I have read and agree to the{" "}
            <span className="underline text-red-600">Terms & Conditions</span>
          </span>
        </div>
        <TermsAndConditionModal
          isOpen={termsOpen}
          onClose={() => setTermsOpen(false)}
          onAgree={() => setAgreed(true)}
          agreed={agreed}
          color={color}
        />
      </div>
      <div
        className={`mt-6 p-3 rounded-md flex items-center justify-center ${
          isFormValid
            ? "bg-red-50 text-red-800"
            : "bg-red-100 text-red-900"
        }`}
      >
        {isFormValid ? (
          <span className="text-base">Ready for submission</span>
        ) : (
          <span className="text-base">Please complete all required fields</span>
        )}
      </div>
    </>
  );
});