import { EventDetails } from "@/interface/user-props"

export async function fetchFacultyEvents(date?: string): Promise<EventDetails[]> {
  // Replace with your actual API endpoint
  const endpoint = `/api/faculty-events${date ? `?date=${date}` : ""}`
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error("Failed to fetch events")
  const data = await response.json()
  // Increase delay to 8 seconds
  await new Promise(resolve => setTimeout(resolve, 8000))
  return data
}