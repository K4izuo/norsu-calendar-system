"use client";

import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PeopleTable } from "@/features/people/components/people-table";
import { PeopleAddModal } from "@/features/people/components/people-add-modal";
import { PeopleLinkModal } from "@/features/people/components/people-link-modal";
import { usePeople, useDeletePerson } from "@/features/people/services/people-service";
import { Search, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import type { Person } from "@/features/people/types/people.types";

export default function PeoplePage() {
  const params = useParams();
  const role = params.role as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { people, error, loading } = usePeople();
  const { mutate: deletePerson } = useDeletePerson();

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesSearch = person.personName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "linked" && person.userLinkId !== null) ||
        (statusFilter === "unlinked" && person.userLinkId === null);
      return matchesSearch && matchesStatus;
    });
  }, [people, searchQuery, statusFilter]);

  const handleLinkClick = (person: Person) => {
    setSelectedPerson(person);
    setIsLinkModalOpen(true);
  };

  const handleEditClick = (person: Person) => {
    setEditPerson(person);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (person: Person) => {
    if (confirm(`Delete "${person.personName}" from the people list?`)) {
      deletePerson(person.id);
    }
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setEditPerson(null);
  };

  return (
    <div className="flex flex-col w-full min-w-0">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "People" },
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between mb-6 gap-y-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 shadow-xs h-11 cursor-pointer bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">All People</SelectItem>
              <SelectItem className="cursor-pointer" value="linked">Linked</SelectItem>
              <SelectItem className="cursor-pointer" value="unlinked">Unlinked</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white h-11 pr-4 py-2 w-64 border border-border rounded-md text-sm"
            />
          </div>
        </div>

        <Button
          onClick={() => { setEditPerson(null); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 h-11 px-4 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Person
        </Button>
      </div>

      <PeopleTable
        people={filteredPeople}
        isLoading={loading}
        onLinkClick={handleLinkClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <PeopleAddModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        editPerson={editPerson}
      />

      <PeopleLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => { setIsLinkModalOpen(false); setSelectedPerson(null); }}
        person={selectedPerson}
        allPeople={people}
      />
    </div>
  );
}
