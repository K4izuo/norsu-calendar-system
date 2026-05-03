import React from "react";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { EventDetails } from "@/interface/user-props";

interface RequestorCardProps {
  requestor: NonNullable<EventDetails["requestor"]>;
}

export function RequestorCard({ requestor }: RequestorCardProps) {
  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        {requestor.type === 'student' && <Users className="text-gray-700 mr-2 h-5 w-5" />}
        {requestor.type === 'faculty' && <GraduationCap className="text-gray-700 mr-2 h-5 w-5" />}
        {requestor.type === 'office' && <Building2 className="text-gray-700 mr-2 h-5 w-5" />}
        <h3 className="text-lg font-medium text-gray-700">Requestor</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium text-base capitalize">{requestor.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium text-base">
            {requestor.type === 'student' && (() => {
              const labels: Record<string, string> = { student_org: 'Student Organization/Society', csg: 'College Student Government', lso: 'LSO', sgdc: 'SGDC' };
              return labels[requestor.student_sub_type ?? ''] ?? 'Student';
            })()}
            {requestor.type === 'faculty' && 'Faculty'}
            {requestor.type === 'office' && 'Office'}
          </p>
        </div>
        {requestor.type === 'student' && requestor.student_sub_type === 'student_org' && requestor.student_org_name && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Organization / Society Name</p>
            <p className="font-medium text-base">{requestor.student_org_name}</p>
          </div>
        )}
        {requestor.type === 'student' && requestor.student_sub_type === 'csg' && requestor.csg_name && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">College Student Government Name</p>
            <p className="font-medium text-base">{requestor.csg_name}</p>
          </div>
        )}
        {(requestor.type === 'faculty' || requestor.type === 'office') && requestor.tagged && requestor.tagged.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">{requestor.type === 'faculty' ? 'Degree Course' : 'Office'}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {requestor.tagged.map((item) => (
                <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {requestor.type === 'faculty'
                    ? <GraduationCap className="w-3.5 h-3.5 text-green-600" />
                    : <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
