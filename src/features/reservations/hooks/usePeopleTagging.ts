import React, { useRef, useState } from "react";

export const usePeopleTagging = () => {
  const [tagInput, setTagInput] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<{ id: number; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const peopleFieldRef = useRef<HTMLInputElement>(null);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const handleTagSelect = (person: { id: number; name: string }) => {
    if (!taggedPeople.some(p => p.id === person.id)) {
      setTaggedPeople([...taggedPeople, person]);
      setTagInput("");
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (id: number) => {
    setTaggedPeople(taggedPeople.filter(p => p.id !== id));
  };

  return {
    tagInput,
    setTagInput,
    taggedPeople,
    showDropdown,
    setShowDropdown,
    peopleFieldRef,
    setTaggedPeople,
    handleTagInputChange,
    handleTagSelect,
    handleRemoveTag,
  };
};
