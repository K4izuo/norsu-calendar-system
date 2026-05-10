"use client";

import { useState } from "react";
import { z } from "zod";
import { Users, GraduationCap, Building2, X, Check, AlertCircle } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCourses, useOffices } from "@/features/calendar/services/academicDataService";
import { useReservationFieldValidation } from "@/features/reservations/utils/reservation-field-validation";
import { RequestorInfo } from "@/interface/user-props";

interface Props {
  requestor: RequestorInfo | null;
  onChange: (info: RequestorInfo | null) => void;
  error?: string;
  validationAttempted?: boolean;
  onClearError?: (error: string) => void;
}

const STUDENT_CHECKBOXES: {
  key: 'student_org' | 'csg' | 'lso' | 'sgdc';
  label: string;
}[] = [
    { key: 'student_org', label: 'Student Organization/Society' },
    { key: 'csg', label: 'College Student Government' },
    { key: 'lso', label: 'LSO' },
    { key: 'sgdc', label: 'SGDC' },
  ];

const STUDENT_NAME_FIELDS: Partial<Record<'student_org' | 'csg' | 'lso' | 'sgdc', {
  label: string;
  placeholder: string;
  valueKey: 'student_org_name' | 'csg_name';
}>> = {
  student_org: {
    label: "Student Organization/Society Name",
    placeholder: "Enter organization/society name",
    valueKey: "student_org_name",
  },
  csg: {
    label: "College Student Government Name",
    placeholder: "Enter college student government name",
    valueKey: "csg_name",
  },
};

const INPUT_FIELD_ERRORS: Record<'student_org' | 'csg' | 'student_category' | 'requested_by', string> = {
  student_org: "Please enter the student organization/society name.",
  csg: "Please enter the college student government name.",
  student_category: "Please select a student category.",
  requested_by: "Please enter the requested by name.",
};

const REQUESTED_BY_SCHEMA = z
  .string()
  .trim()
  .min(1, INPUT_FIELD_ERRORS.requested_by);

export function EventRequestorTab({
  requestor,
  onChange,
  error,
  validationAttempted = false,
  onClearError,
}: Props) {
  const [facultyInput, setFacultyInput] = useState("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [officeInput, setOfficeInput] = useState("");
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);

  const { courses } = useCourses();
  const { offices } = useOffices();

  const selectedType = requestor?.type;

  const handleTypeSelect = (type: 'student' | 'faculty' | 'office') => {
    if (selectedType === type) {
      onChange(null);
    } else {
      onChange({ type });
    }
    setFacultyInput("");
    setOfficeInput("");
  };

  const handleStudentSubTypeSelect = (subType: 'student_org' | 'csg' | 'lso' | 'sgdc') => {
    if (requestor?.student_sub_type === subType) {
      onChange({ type: 'student', requested_by: requestor.requested_by });
    } else {
      onChange({
        type: 'student',
        student_sub_type: subType,
        requested_by: requestor?.requested_by,
        student_org_name: subType === 'student_org' ? requestor?.student_org_name : undefined,
        csg_name: subType === 'csg' ? requestor?.csg_name : undefined,
      });
      if (error === INPUT_FIELD_ERRORS.student_category) {
        onClearError?.("");
      }
    }
  };

  const filteredCourses = facultyInput.length > 0
    ? courses.filter(c => c.label.toLowerCase().includes(facultyInput.toLowerCase()))
    : [];

  const handleFacultySelect = (item: { value: string; label: string }) => {
    onChange({ ...(requestor ?? {}), type: 'faculty', tagged: [{ id: parseInt(item.value), name: item.label }] });
    setFacultyInput("");
    setShowFacultyDropdown(false);
  };

  const filteredOffices = officeInput.length > 0
    ? offices.filter(o => o.label.toLowerCase().includes(officeInput.toLowerCase()))
    : [];

  const handleOfficeSelect = (item: { value: string; label: string }) => {
    onChange({ ...(requestor ?? {}), type: 'office', tagged: [{ id: parseInt(item.value), name: item.label }] });
    setOfficeInput("");
    setShowOfficeDropdown(false);
  };

  const hasFacultyTag = requestor?.tagged && requestor.tagged.length > 0;
  const hasOfficeTag = requestor?.tagged && requestor.tagged.length > 0;
  const selectedStudentCategory = requestor?.type === 'student' ? requestor.student_sub_type : undefined;
  const selectedStudentNameField = selectedStudentCategory
    ? STUDENT_NAME_FIELDS[selectedStudentCategory]
    : undefined;
  const selectedStudentNameError =
    selectedStudentCategory === 'student_org' || selectedStudentCategory === 'csg'
      ? INPUT_FIELD_ERRORS[selectedStudentCategory]
      : undefined;
  const requestedByValue = requestor?.requested_by ?? "";
  const hasRequestedByRequiredError = error === INPUT_FIELD_ERRORS.requested_by;
  const requestedByValidationError = useReservationFieldValidation(
    requestedByValue,
    REQUESTED_BY_SCHEMA,
    { validateEmpty: validationAttempted },
  );
  const requestedByRequiredError = validationAttempted && !requestedByValue.trim()
    ? INPUT_FIELD_ERRORS.requested_by
    : "";
  const requestedByDisplayError = requestedByRequiredError || (hasRequestedByRequiredError
    ? INPUT_FIELD_ERRORS.requested_by
    : requestedByValidationError);
  const hasRequestedByError = Boolean(requestedByDisplayError);

  return (
    <div className="space-y-6">
      {/* Type selection buttons */}
      <div className="flex flex-col gap-1.5">
        <Label>Select Requestor Type <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleTypeSelect('student')}
            disabled={!!selectedType && selectedType !== 'student'}
            className={`flex flex-col cursor-pointer items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selectedType === 'student'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white enabled:hover:border-blue-300 enabled:hover:bg-blue-50/50'
              }`}
          >
            <Users
              className={`w-9 h-9 ${selectedType === 'student' ? 'text-blue-600' : 'text-gray-400'}`}
              strokeWidth={1.5}
            />
            <span className={`text-base font-semibold ${selectedType === 'student' ? 'text-blue-700' : 'text-gray-600'}`}>
              Student
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect('faculty')}
            disabled={!!selectedType && selectedType !== 'faculty'}
            className={`flex flex-col cursor-pointer items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selectedType === 'faculty'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white enabled:hover:border-green-300 enabled:hover:bg-green-50/50'
              }`}
          >
            <GraduationCap
              className={`w-9 h-9 ${selectedType === 'faculty' ? 'text-green-600' : 'text-gray-400'}`}
              strokeWidth={1.5}
            />
            <span className={`text-base font-semibold ${selectedType === 'faculty' ? 'text-green-700' : 'text-gray-600'}`}>
              Faculty
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect('office')}
            disabled={!!selectedType && selectedType !== 'office'}
            className={`flex flex-col cursor-pointer items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selectedType === 'office'
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 bg-white enabled:hover:border-amber-300 enabled:hover:bg-amber-50/50'
              }`}
          >
            <Building2
              className={`w-9 h-9 ${selectedType === 'office' ? 'text-amber-600' : 'text-gray-400'}`}
              strokeWidth={1.5}
            />
            <span className={`text-base font-semibold ${selectedType === 'office' ? 'text-amber-700' : 'text-gray-600'}`}>
              Office
            </span>
          </button>
        </div>

        {error && !Object.values(INPUT_FIELD_ERRORS).includes(error) && (
          <p className="flex items-center gap-1 text-red-500 text-sm mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Student section */}
      {selectedType === 'student' && (
        <div className="flex flex-col gap-1.5">
          <Label>Select Student Category <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-3">
            {STUDENT_CHECKBOXES.map(({ key, label }) => {
              const isChecked = requestor?.student_sub_type === key;
              const isDisabled = !!requestor?.student_sub_type && !isChecked;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${isChecked ? "border-gray-800 bg-gray-100" : isDisabled ? "border-border bg-white" : error === INPUT_FIELD_ERRORS.student_category ? "border-red-500 bg-white hover:bg-muted" : "border-border bg-white hover:bg-muted"
                    } ${isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  <button
                    type="button"
                    onClick={() => !isDisabled && handleStudentSubTypeSelect(key)}
                    disabled={isDisabled}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isChecked ? "border-gray-800 bg-gray-800" : "border-gray-300 bg-white"
                        }`}
                    >
                      {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className={`text-sm font-medium ${isChecked ? "text-gray-800" : "text-gray-700"}`}>
                      {label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          {error === INPUT_FIELD_ERRORS.student_category && (
            <p className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {INPUT_FIELD_ERRORS.student_category}
            </p>
          )}
          {selectedStudentCategory && (
            <div className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedStudentNameField && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">
                      {selectedStudentNameField.label} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder={selectedStudentNameField.placeholder}
                      value={requestor?.[selectedStudentNameField.valueKey] ?? ""}
                      onChange={(e) => {
                        onChange({ ...requestor!, [selectedStudentNameField.valueKey]: e.target.value });
                        if (e.target.value.trim() && error === selectedStudentNameError) {
                          onClearError?.("");
                        }
                      }}
                      className={`h-11 border text-base ${error === selectedStudentNameError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                        }`}
                    />
                    {error === selectedStudentNameError && (
                      <p className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {selectedStudentNameError}
                      </p>
                    )}
                  </div>
                )}
                <div className={`space-y-1.5 ${selectedStudentNameField ? "" : "md:col-span-2"}`}>
                  <Label className="text-sm text-gray-700">
                    Requested by <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter requester name"
                    value={requestor?.requested_by ?? ""}
                    onChange={(e) => {
                      onChange({ ...requestor!, requested_by: e.target.value });
                      if (e.target.value.trim() && hasRequestedByRequiredError) {
                        onClearError?.("");
                      }
                    }}
                    className={`h-11 border text-base ${hasRequestedByError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                      }`}
                  />
                  {hasRequestedByError && (
                    <p className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {requestedByDisplayError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Faculty section */}
      {selectedType === 'faculty' && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Tag Faculty / Degree Course <span className="text-red-500">*</span>
          </p>

          {hasFacultyTag ? (
            <div className="flex flex-wrap gap-2">
              {requestor!.tagged!.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  {item.name}
                  <button
                    type="button"
                    onClick={() => onChange({ type: 'faculty', requested_by: requestor?.requested_by, tagged: [] })}
                    className="ml-0.5 hover:text-green-950 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="relative">
              <Input
                type="text"
                placeholder="Type a degree course name..."
                value={facultyInput}
                onChange={(e) => {
                  setFacultyInput(e.target.value);
                  setShowFacultyDropdown(e.target.value.length > 0);
                }}
                onBlur={() => setTimeout(() => setShowFacultyDropdown(false), 150)}
                onFocus={() => setShowFacultyDropdown(facultyInput.length > 0)}
                className="h-11 border-2 border-gray-200 focus:border-green-500 text-base"
                autoComplete="off"
              />
              {showFacultyDropdown && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <button
                        key={course.value}
                        type="button"
                        className="flex items-center w-full px-3 py-2.5 text-left hover:bg-green-50 text-base"
                        onMouseDown={() => handleFacultySelect(course)}
                      >
                        <GraduationCap className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                        {course.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-gray-400 text-sm">No matches found</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Requested by <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter requester name"
              value={requestor?.requested_by ?? ""}
              onChange={(e) => {
                onChange({ ...(requestor ?? { type: 'faculty' }), type: 'faculty', requested_by: e.target.value });
                if (e.target.value.trim() && hasRequestedByRequiredError) {
                  onClearError?.("");
                }
              }}
              className={`h-11 border text-base ${hasRequestedByError
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-green-500"
                }`}
            />
            {hasRequestedByError && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {requestedByDisplayError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Office section */}
      {selectedType === 'office' && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Tag Office <span className="text-red-500">*</span>
          </p>

          {hasOfficeTag ? (
            <div className="flex flex-wrap gap-2">
              {requestor!.tagged!.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  {item.name}
                  <button
                    type="button"
                    onClick={() => onChange({ type: 'office', requested_by: requestor?.requested_by, tagged: [] })}
                    className="ml-0.5 hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="relative">
              <Input
                type="text"
                placeholder="Type an office name..."
                value={officeInput}
                onChange={(e) => {
                  setOfficeInput(e.target.value);
                  setShowOfficeDropdown(e.target.value.length > 0);
                }}
                onBlur={() => setTimeout(() => setShowOfficeDropdown(false), 150)}
                onFocus={() => setShowOfficeDropdown(officeInput.length > 0)}
                className="h-11 border-2 border-gray-200 focus:border-amber-500 text-base"
                autoComplete="off"
              />
              {showOfficeDropdown && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredOffices.length > 0 ? (
                    filteredOffices.map((office) => (
                      <button
                        key={office.value}
                        type="button"
                        className="flex items-center w-full px-3 py-2.5 text-left hover:bg-amber-50 text-base"
                        onMouseDown={() => handleOfficeSelect(office)}
                      >
                        <Building2 className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                        {office.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-gray-400 text-sm">No matches found</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Requested by <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter requester name"
              value={requestor?.requested_by ?? ""}
              onChange={(e) => {
                onChange({ ...(requestor ?? { type: 'office' }), type: 'office', requested_by: e.target.value });
                if (e.target.value.trim() && hasRequestedByRequiredError) {
                  onClearError?.("");
                }
              }}
              className={`h-11 border text-base ${hasRequestedByError
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-amber-500"
                }`}
            />
            {hasRequestedByError && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {requestedByDisplayError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
