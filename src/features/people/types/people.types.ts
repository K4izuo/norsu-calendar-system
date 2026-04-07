export interface Person {
  id: number
  personName: string
  userLinkId: number | null
  linkTimestamp: string | null
  linkedByUserId: number | null
  linkedUser?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  linkedByUser?: {
    id: number
    first_name: string
    last_name: string
  }
  created_at: string
  updated_at: string
}

export interface CreatePersonPayload {
  personName: string
}

export interface LinkUserPayload {
  user_id: number
}
