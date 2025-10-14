import React, { memo } from "react";
import { User } from "lucide-react";

type AdminSummaryProps = {
  formData: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    adminID: string;
  };
  isFormValid: boolean;
};

export const AdminSummary = memo(function AdminSummary({
  formData,
  isFormValid,
}: AdminSummaryProps) {
  return (
    <>
      <div className="bg-gray-50 shadow-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          <User className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Admin Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Full Name</p>
            <p className="font-medium text-base text-gray-800">
              {`${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim() || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Email</p>
            <p className="font-medium text-base text-gray-800">{formData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Admin ID</p>
            <p className="font-medium text-base text-gray-800">{formData.adminID || "Not provided"}</p>
          </div>
        </div>
      </div>
      <div
        className={`mt-6 p-3 rounded-md flex items-center justify-center ${
          isFormValid
            ? "bg-gray-700 text-white"
            : "bg-yellow-50 text-yellow-800"
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