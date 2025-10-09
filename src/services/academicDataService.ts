import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";

export type Campus = {
  id: number;
  campus_name: string;
};

export type Office = {
  id: number;
  office_name: string;
};

export type Course = {
  id: number;
  degree_name: string;
};

export type OptionType = {
  value: string;
  label: string;
};

export const useCampuses = () => {
  const [campuses, setCampuses] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCampuses() {
      if (campuses.length > 0) return;
      setLoading(true);

      try {
        const response = await apiClient.get<Campus[]>('campuses/all');
        if (response.error) throw new Error(response.error);

        if (isMounted && response.data) {
          setCampuses(
            response.data.map(campus => ({
              value: campus.id.toString(),
              label: campus.campus_name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching campuses:", error);
        if (isMounted) setError("Failed to load campuses");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCampuses();
    return () => { isMounted = false; };
  }, []);

  return { campuses, loading, error };
};

export const useOffices = () => {
  const [offices, setOffices] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOffices() {
      if (offices.length > 0) return;
      setLoading(true);

      try {
        const response = await apiClient.get<Office[]>('offices/all');
        if (response.error) throw new Error(response.error);

        if (isMounted && response.data) {
          setOffices(
            response.data.map(office => ({
              value: office.id.toString(),
              label: office.office_name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
        if (isMounted) setError("Failed to load offices");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOffices();
    return () => { isMounted = false; };
  }, []);

  return { offices, loading, error };
};

export const useCourses = (collegeId: string) => {
  const [courses, setCourses] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId) {
      setCourses([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient
      .get<Course[]>(`degreeCourse/${collegeId}`)
      .then(response => {
        if (!isMounted) return;

        if (response.error) {
          setCourses([]);
          setError("No courses available for this college.");
          return;
        }

        if (response.data && response.data.length > 0) {
          setCourses(
            response.data.map(course => ({
              value: course.id.toString(),
              label: course.degree_name,
            }))
          );
          setError(null);
        } else {
          setCourses([]);
          setError("No courses available for this college.");
        }
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
        if (isMounted) setError("Failed to load courses");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [collegeId]);

  return { courses, loading, error };
};