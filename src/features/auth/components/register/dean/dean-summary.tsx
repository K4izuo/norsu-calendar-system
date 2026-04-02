import React, { memo, useState } from "react";
import { User, KeyRound, Eye, EyeOff } from "lucide-react";
import { DeanRegisterFormData } from "@/interface/user-props";
import { OptionType } from "@/features/calendar/services/academicDataService";
import { TermsAndConditionModal } from "@/shared/components/privacy/terms-and-condition-modal";
import { Checkbox } from "@/shared/components/ui/checkbox";

type DeanSummaryProps = {
  formData: DeanRegisterFormData & { username?: string; password?: string };
  campuses: OptionType[];
  offices: OptionType[];
  isFormValid: boolean;
  agreed: boolean;
  setAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  color?: "emerald" | "indigo" | "purple";
};

export const DeanSummary = memo(function DeanSummary({
  formData,
  campuses,
  offices,
  agreed,
  setAgreed,
}: DeanSummaryProps) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="bg-white text-card-foreground border shadow-xs rounded-lg">
        <div className="flex items-center p-6">
          <User className="w-5 h-5 text-gray-700 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Dean Information</h3>
        </div>
        <div className="border-t border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-base">
              {`${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim() ||
                "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-base">{formData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dean ID</p>
            <p className="font-medium text-base">{formData.assignment_id || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Campus</p>
            <p className="font-medium text-base">
              {campuses.find((c) => c.value === formData.campus_id)?.label || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Office</p>
            <p className="font-medium text-base">
              {offices.find((o) => o.value === formData.office_id)?.label || "Not selected"}
            </p>
          </div>
        </div>
      </div>

      {/* Credentials box */}
      {(formData.username || formData.password) && (
        <div className="bg-white text-card-foreground border shadow-xs rounded-lg mt-4">
          <div className="flex items-center p-6">
            <KeyRound className="w-5 h-5 text-gray-700 mr-2" />
            <h3 className="text-lg font-medium text-gray-700">Credentials</h3>
          </div>
          <div className="border-t border-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {formData.username && (
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium text-base">{formData.username}</p>
              </div>
            )}
            {formData.password && (
              <div>
                <p className="text-sm text-gray-500">Password</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-base">
                    {showPassword ? formData.password : "•".repeat(formData.password.length)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms and Condition Checkbox */}
      <div className="flex items-center mt-4">
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
          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 cursor-pointer"
        />
        <span
          className="ml-3 text-base text-gray-700 cursor-pointer select-none"
          onClick={() => setTermsOpen(true)}
        >
          I have read and agree to the{" "}
          <span className="underline text-indigo-600">Terms & Conditions</span>
        </span>
      </div>
      <TermsAndConditionModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAgree={() => setAgreed(true)}
        agreed={agreed}
        color="indigo"
      />

    </>
  );
});