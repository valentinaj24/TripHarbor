
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type UserRole = 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data as T;
}

export async function register(
  data: RegisterData
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(
  data: LoginData
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(
  token: string
): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface Trip {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  startDate: string
  endDate: string
  maxParticipants: number
  availableSpots: number
  meetingPoint: string
  destination: {
    id: string
    name: string
    country: string
    latitude: number
    longitude: number
  }
  organizer: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface TripFilters {
  search?: string
  category?: string
  difficulty?: string
  startDate?: string
  endDate?: string
  sort?: 'date_asc' | 'date_desc' | 'title_asc'
  page?: number
  limit?: number
}

export interface TripsResponse {
  data: Trip[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getTrips(
  filters: TripFilters = {}
): Promise<TripsResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()

  return apiRequest<TripsResponse>(
    `/api/trips${query ? `?${query}` : ''}`
  )
}

export interface TripActivity {
  id: string
  title: string
  description: string | null
  activityDate: string
  startTime: string | null
  locationName: string
  latitude: number | null
  longitude: number | null
  sortOrder: number
}

export interface TripDetails extends Trip {
  activities: TripActivity[]
}

export async function getTripById(
  id: string
): Promise<{ data: TripDetails }> {
  return apiRequest<{ data: TripDetails }>(
    `/api/trips/${encodeURIComponent(id)}`
  )
}
export type TripStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'CANCELLED'

export interface OrganizerTrip extends Omit<Trip, 'organizer'> {
  coverUrl: string | null
  status: TripStatus
  createdAt: string
}

export async function getMyTrips(): Promise<{ data: OrganizerTrip[] }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in to view your trips.')
  }

  return apiRequest<{ data: OrganizerTrip[] }>('/api/trips/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
export interface DestinationSuggestion {
  externalPlaceId: string
  name: string
  country: string
  displayName: string
  latitude: number
  longitude: number
}


export interface CreateTripData {
  title: string
  description: string
  coverUrl?: string
  category: string
  difficulty: string
  startDate: string
  endDate: string
  maxParticipants: number
  meetingPoint: string
  destination: Omit<DestinationSuggestion, 'displayName'>
  activities?: ActivityFormData[]
}


export async function searchDestinations(
  query: string
): Promise<{ data: DestinationSuggestion[] }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in to search destinations.')
  }

  return apiRequest<{ data: DestinationSuggestion[] }>(
    `/api/destinations/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export async function createTrip(
  data: CreateTripData
): Promise<{ message: string; data: OrganizerTrip }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in to create a trip.')
  }

  return apiRequest<{ message: string; data: OrganizerTrip }>(
    '/api/trips',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
}
export interface EditableTrip {
  id: string
  title: string
  description: string
  coverUrl: string | null
  category: string
  difficulty: string
  startDate: string
  endDate: string
  maxParticipants: number
  meetingPoint: string
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'CANCELLED'
  destination: {
    id: string
    externalPlaceId: string | null
    name: string
    country: string
    latitude: number
    longitude: number
  }
}

export async function getMyTripById(
  id: string
): Promise<{ data: EditableTrip }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{ data: EditableTrip }>(
    `/api/trips/my/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export async function updateTrip(
  id: string,
  data: Partial<CreateTripData>
): Promise<{ message: string; data: EditableTrip }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{ message: string; data: EditableTrip }>(
    `/api/trips/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
}
export async function submitTripForApproval(
  id: string
): Promise<{ message: string; data: { id: string; status: 'PENDING' } }> {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest(
    `/api/trips/${encodeURIComponent(id)}/submit`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export interface TripItineraryActivity {
  id: string
  tripId: string
  title: string
  description: string | null
  activityDate: string
  startTime: string | null
  locationName: string
  latitude: number | null
  longitude: number | null
  sortOrder: number
}

export interface ActivityFormData {
  title: string
  description?: string | null
  activityDate: string
  startTime?: string | null
  locationName: string
  latitude?: number | null
  longitude?: number | null
  sortOrder: number
}

function activityAuthHeaders() {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export function getTripActivities(tripId: string) {
  return apiRequest<{ data: TripItineraryActivity[] }>(
    `/api/trips/${encodeURIComponent(tripId)}/activities`,
    {
      headers: activityAuthHeaders(),
    }
  )
}

export function createTripActivity(
  tripId: string,
  data: ActivityFormData
) {
  return apiRequest<{
    message: string
    data: TripItineraryActivity
  }>(
    `/api/trips/${encodeURIComponent(tripId)}/activities`,
    {
      method: 'POST',
      headers: activityAuthHeaders(),
      body: JSON.stringify(data),
    }
  )
}

export function updateTripActivity(
  tripId: string,
  activityId: string,
  data: Partial<ActivityFormData>
) {
  return apiRequest<{
    message: string
    data: TripItineraryActivity
  }>(
    `/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`,
    {
      method: 'PATCH',
      headers: activityAuthHeaders(),
      body: JSON.stringify(data),
    }
  )
}

export function deleteTripActivity(
  tripId: string,
  activityId: string
) {
  return apiRequest<{ message: string }>(
    `/api/trips/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}`,
    {
      method: 'DELETE',
      headers: activityAuthHeaders(),
    }
  )
}

export interface PlaceSuggestion {
  placeId: string
  name: string
  displayName: string
  city: string
  country: string
  latitude: number
  longitude: number
}

export function searchPlaces(query: string) {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{ data: PlaceSuggestion[] }>(
    `/api/destinations/places?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export async function reorderTripActivities(
  tripId: string,
  orderedIds: string[]
): Promise<{ message: string; data: TripItineraryActivity[] }> {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest(
    `/api/trips/${tripId}/activities/reorder`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderedIds }),
    }
  )
}
