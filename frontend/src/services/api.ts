
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
