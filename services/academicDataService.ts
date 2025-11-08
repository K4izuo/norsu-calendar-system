import { apiClient } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export type Campus = { id: number; campus_name: string };
export type Office = { id: number; office_name: string };
export type Course = { id: number; degree_name: string };
export type Asset = { 
  id: number; 
  asset_name: string; 
  asset_type: string;
  capacity: number;
  location: string;
};
export type OptionType = { value: string; label: string };

// Helper function to determine error message based on error text and resource type
function getErrorMessage(error: string, resourceType: string) {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes("not found") || errorLower.includes("404"))
    return `${resourceType} list not found on server`;
  
  if (errorLower.includes(resourceType.toLowerCase()))
    return `No ${resourceType.toLowerCase()}s available at this time`;
  
  if (errorLower.includes("permission") || errorLower.includes("unauthorized"))
    return `You don't have permission to view ${resourceType.toLowerCase()}s`;
  
  if (errorLower.includes("connection") || errorLower.includes("network"))
    return `Network error while loading ${resourceType.toLowerCase()}s`;
  
  return `Failed to load ${resourceType.toLowerCase()}s`;
}

// Helper function to map API data to dropdown options
function mapToOptions<T extends {id: number}>(
  data: T[], 
  labelKey: keyof T
): OptionType[] {
  return data.map(item => ({
    value: item.id.toString(),
    label: String(item[labelKey])
  }));
}

export const useCampuses = () => {
  const [campuses, setCampuses] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add a ref to track if data was loaded
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Skip if we've already fetched data
    if (dataFetchedRef.current) return;
    
    let isMounted = true;
    const toastId = "campus-fetch";
    setLoading(true);

    apiClient.get<Campus[]>('campuses/all')
      .then(response => {
        if (!isMounted) return;
        
        if (response.error) {
          const userErrorMessage = getErrorMessage(response.error, "Campus");
          setError(`Campus Error: ${userErrorMessage}`);
          toast.error(userErrorMessage, { id: toastId });
          return;
        }

        if (!response.data || response.data.length === 0) {
          setError("No campuses found");
          toast.error("No campuses found", { id: toastId });
          return;
        }

        setCampuses(mapToOptions(response.data, 'campus_name'));
        setError(null);
        dataFetchedRef.current = true;
      })
      .catch(error => {
        console.error("Error fetching campuses:", error);
        if (isMounted) {
          setError("Campus Error: Failed to load campus list");
          toast.error("Failed to load campuses", { id: toastId });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []); // Empty dependency array - only runs on mount

  return { campuses, loading, error };
};

export const useOffices = () => {
  const [offices, setOffices] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    
    let isMounted = true;
    const toastId = "college-fetch";
    setLoading(true);

    apiClient.get<Office[]>('offices/all')
      .then(response => {
        if (!isMounted) return;
        
        if (response.error) {
          const userErrorMessage = getErrorMessage(response.error, "College");
          setError(`College Error: ${userErrorMessage}`);
          toast.error(userErrorMessage, { id: toastId });
          return;
        }

        if (!response.data || response.data.length === 0) {
          setError("No colleges found");
          toast.error("No colleges found", { id: toastId });
          return;
        }

        setOffices(mapToOptions(response.data, 'office_name'));
        setError(null);
        dataFetchedRef.current = true;
      })
      .catch(error => {
        console.error("Error fetching offices:", error);
        if (isMounted) {
          setError("College Error: Failed to load college list");
          toast.error("Failed to load colleges", { id: toastId });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []); // Empty dependency array

  return { offices, loading, error };
};

export const useCourses = (collegeId: string) => {
  const [courses, setCourses] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track previous collegeId to avoid unnecessary refetches
  const prevCollegeIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if collegeId is empty or unchanged
    if (!collegeId || collegeId === prevCollegeIdRef.current) {
      return;
    }
    
    prevCollegeIdRef.current = collegeId;
    let isMounted = true;
    const toastId = `course-fetch-${collegeId}`;
    setLoading(true);
    setError(null);

    apiClient.get<Course[]>(`degreeCourse/${collegeId}`)
      .then(response => {
        if (!isMounted) return;

        if (response.error) {
          const errorLower = response.error.toLowerCase();
          let userErrorMessage = getErrorMessage(response.error, "Course");
          
          if (errorLower.includes("invalid") && errorLower.includes("college")) {
            userErrorMessage = "Invalid college selected";
          }
            
          setCourses([]);
          setError(`Course Error: ${userErrorMessage}`);
          toast.error(userErrorMessage, { id: toastId });
          return;
        }

        if (!response.data || response.data.length === 0) {
          setCourses([]);
          const noCoursesMsg = "No courses available for this college";
          setError(`Course Error: ${noCoursesMsg}`);
          toast.error(noCoursesMsg, { id: toastId });
          return;
        }

        setCourses(mapToOptions(response.data, 'degree_name'));
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
        if (isMounted) {
          setError("Course Error: Failed to load course list");
          toast.error("Failed to load courses", { id: toastId });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [collegeId]); // Only collegeId as dependency

  return { courses, loading, error };
};

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    
    let isMounted = true;
    const toastId = "raw-asset-fetch";
    setLoading(true);

    apiClient.get<Asset[]>('assets/all')
      .then(response => {
        if (!isMounted) return;

        if (response.error) {
          const userErrorMessage = getErrorMessage(response.error, "Asset");
          setError(`Asset Error: ${userErrorMessage}`);
          toast.error(userErrorMessage, { id: toastId });
          return;
        }

        if (!response.data || response.data.length === 0) {
          setError("No assets found");
          toast.error("No assets found", { id: toastId });
          return;
        }

        setAssets(response.data); // Return raw Asset[] data instead of mapped OptionType[]
        setError(null);
        dataFetchedRef.current = true;
      })
      .catch(error => {
        console.error("Error fetching raw assets:", error);
        if (isMounted) {
          setError("Asset Error: Failed to load asset list");
          toast.error("Failed to load assets", { id: toastId });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { assets, loading, error };
};