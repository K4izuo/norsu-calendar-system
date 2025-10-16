import React from "react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  borderColor: string;
  icon: React.ReactNode;
  titleColor: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  borderColor,
  icon,
  titleColor,
}) => (
  <div
    className={`flex flex-row items-center justify-between rounded-xl border-l-8 bg-white shadow-sm p-6 min-h-[110px]`}
    style={{ borderLeftColor: borderColor }}
  >
    <div className="flex flex-col justify-center">
      <h2 className={`text-sm font-semibold tracking-wide mb-2`} style={{ color: titleColor }}>
        {title}
      </h2>
      <h1 className="text-2xl font-extrabold text-gray-700">{value}</h1>
    </div>
    <div className="flex items-center justify-center rounded-lg">
      {icon}
    </div>
  </div>
);

export default DashboardStatCard;