export const infoTypes = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "restricted", label: "Restricted" },
];

export const categories = [
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

export const formattedAssets = [{ id: 1, asset_name: "Venue", capacity: 0 }];

export const formatDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch {
    return dateStr;
  }
};
