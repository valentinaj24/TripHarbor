
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
  rejectionReason: string | null
  reviewedAt: string | null
  createdAt: string
  cancellationReason: string | null
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

export interface ActivityWarning {
  code: 'DUPLICATE_TIME' | 'DUPLICATE_ORDER' | 'OUTSIDE_TRIP_DATES'
  message: string
  activityIds: string[]
}

export async function getTripActivityWarnings(
  tripId: string
): Promise<{ warnings: ActivityWarning[] }> {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest(`/api/trips/${tripId}/activities/warnings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export type RegistrationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'

export interface TripRegistration {
  id: string
  status: RegistrationStatus
  registeredAt: string
}

function registrationAuthHeaders() {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in to register for a trip.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export function getMyTripRegistration(tripId: string) {
  return apiRequest<{ data: TripRegistration | null }>(
    `/api/trips/${encodeURIComponent(tripId)}/registrations/me`,
    {
      headers: registrationAuthHeaders(),
    }
  )
}

export function joinTrip(tripId: string) {
  return apiRequest<{
    message: string
    data: TripRegistration
  }>(
    `/api/trips/${encodeURIComponent(tripId)}/registrations`,
    {
      method: 'POST',
      headers: registrationAuthHeaders(),
    }
  )
}

export function cancelTripRegistration(tripId: string) {
  return apiRequest<{
    message: string
    data: TripRegistration
  }>(
    `/api/trips/${encodeURIComponent(tripId)}/registrations/cancel`,
    {
      method: 'PATCH',
      headers: registrationAuthHeaders(),
    }
  )
}

export interface OrganizerRegistration {
  id: string
  status: RegistrationStatus
  registeredAt: string
  reviewedAt: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface TripRegistrationManagement {
  trip: {
    id: string
    title: string
    status: TripStatus
    maxParticipants: number
    acceptedCount: number
    pendingCount: number
    availableSpots: number
  }
  registrations: OrganizerRegistration[]
}

export function getTripRegistrations(tripId: string) {
  return apiRequest<{ data: TripRegistrationManagement }>(
    `/api/trips/${encodeURIComponent(tripId)}/registrations`,
    {
      headers: registrationAuthHeaders(),
    }
  )
}

export function reviewTripRegistration(
  tripId: string,
  registrationId: string,
  status: 'ACCEPTED' | 'REJECTED'
) {
  return apiRequest<{
    message: string
    data: OrganizerRegistration
  }>(
    `/api/trips/${encodeURIComponent(tripId)}/registrations/${encodeURIComponent(registrationId)}/status`,
    {
      method: 'PATCH',
      headers: registrationAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  )
}
export type MyTripRegistrationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'

export interface MyTripRegistration {
  id: string
  status: MyTripRegistrationStatus
  registeredAt: string
  reviewedAt: string | null
  trip: {
    id: string
    title: string
    description: string
    coverUrl: string | null
    category: string
    startDate: string
    endDate: string
    meetingPoint: string
    status: string
    destination: {
      name: string
      country: string
    }
    organizer: {
      firstName: string
      lastName: string
    }
  }
}

export interface UserProfile extends AuthUser {
  accountStatus: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
}

export function getMyTripRegistrations() {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{ data: MyTripRegistration[] }>(
    '/api/users/me/registrations',
    {
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
    }
  )
}

export function getMyProfile() {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{ user: UserProfile }>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  })
}

export function updateMyProfile(data: {
  firstName: string
  lastName: string
}) {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{
    message: string
    user: UserProfile
  }>('/api/auth/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify(data),
  })
}

export interface AdminRecentTrip {
  id: string
  title: string
  status: TripStatus
  createdAt: string
  destination: {
    name: string
    country: string
  }
  organizer: {
    firstName: string
    lastName: string
  }
}

export interface AdminStats {
pendingOrganizerRequests: number
  users: {
    total: number
    organizers: number
    participants: number
  }
  trips: {
    total: number
    published: number
    pending: number
    drafts: number
    rejected: number
  }
  registrations: {
    total: number
    accepted: number
    pending: number
  }
  recentTrips: AdminRecentTrip[]
}

export function getAdminStats() {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{ data: AdminStats }>('/api/admin/stats', {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  })
}

export interface AdminTripActivity {
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

export interface AdminTrip {
  id: string
  title: string
  description: string
  coverUrl: string | null
  category: string
  difficulty: string
  startDate: string
  endDate: string
  maxParticipants: number
  status: TripStatus
  meetingPoint: string
  createdAt: string
  organizer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  destination: {
    id: string
    name: string
    country: string
    latitude: number
    longitude: number
  }
  activities: AdminTripActivity[]
  acceptedParticipants?: number
}

function adminAuthHeaders() {
  const token = sessionStorage.getItem('tripharbor_token')

  return {
    Authorization: `Bearer ${token ?? ''}`,
  }
}

export function getAdminPendingTrips() {
  return apiRequest<{ data: AdminTrip[] }>(
    '/api/admin/trips/pending',
    {
      headers: adminAuthHeaders(),
    }
  )
}

export function getAdminTrips(status?: TripStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''

  return apiRequest<{ data: AdminTrip[] }>(
    `/api/admin/trips${query}`,
    {
      headers: adminAuthHeaders(),
    }
  )
}

export function reviewAdminTrip(
  tripId: string,
  decision: 'APPROVE' | 'REJECT',
  reason?: string
) {
  return apiRequest<{
    message: string
    data: {
      id: string
      status: TripStatus
    }
  }>(`/api/admin/trips/${tripId}/review`, {
    method: 'PATCH',
    headers: adminAuthHeaders(),
    body: JSON.stringify({
      decision,
      ...(decision === 'REJECT' ? { reason } : {}),
    }),
  })
}

export type OrganizerRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface OrganizerRequest {
  id: string
  userId: string
  motivation: string
  experience: string
  status: OrganizerRequestStatus
  rejectionReason: string | null
  reviewedById: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface SubmitOrganizerRequestData {
  motivation: string
  experience: string
}

export function getMyOrganizerRequests() {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{ data: OrganizerRequest[] }>(
    '/api/organizer-requests/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export function submitOrganizerRequest(
  data: SubmitOrganizerRequestData
) {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{
    message: string
    data: OrganizerRequest
  }>('/api/organizer-requests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export interface AdminOrganizerRequest extends OrganizerRequest {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
  reviewedBy: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export function getAdminOrganizerRequests(
  status?: OrganizerRequestStatus
) {
  const token = sessionStorage.getItem('tripharbor_token')
  const query = status ? `?status=${encodeURIComponent(status)}` : ''

  return apiRequest<{ data: AdminOrganizerRequest[] }>(
    `/api/admin/organizer-requests${query}`,
    {
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
    }
  )
}

export function reviewAdminOrganizerRequest(
  requestId: string,
  decision: 'APPROVE' | 'REJECT',
  reason?: string
) {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{
    message: string
    data: OrganizerRequest
  }>(
    `/api/admin/organizer-requests/${encodeURIComponent(requestId)}/review`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({
        decision,
        ...(decision === 'REJECT' ? { reason } : {}),
      }),
    }
  )
}
// ==========================================
// ADMIN - USERS
// ==========================================

export type AdminAccountStatus = 'ACTIVE' | 'SUSPENDED'


export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN'
  accountStatus: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
  tripCount: number
  registrationCount: number
}


export function getAdminUsers() {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{ data: AdminUser[] }>('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  })
}

export function updateAdminUserStatus(
  userId: string,
  accountStatus: AdminAccountStatus
) {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{
    message: string
    data: AdminUser
  }>(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ status: accountStatus }),
  })
}

// ==========================================
// ADMIN - ANALYTICS
// ==========================================


export interface AdminAnalytics {
  users: { name: string; count: number }[]
  trips: { name: string; count: number }[]
  registrations: { name: string; count: number }[]
  destinations: {
    id: string
    name: string
    country: string
    count: number
  }[]
  recentUsers: {
    id: string
    firstName: string
    lastName: string
    role: 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN'
    createdAt: string
  }[]
}


export function getAdminAnalytics() {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{ data: AdminAnalytics }>('/api/admin/analytics', {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  })
}


export function cancelAdminTrip(tripId: string, reason: string) {
  const token = sessionStorage.getItem('tripharbor_token')

  return apiRequest<{
    message: string
    data: {
      id: string
      status: 'CANCELLED'
    }
  }>(`/api/admin/trips/${encodeURIComponent(tripId)}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ reason }),
  })
}

export function cancelOrganizerTrip(tripId: string, reason: string) {
  const token = sessionStorage.getItem('tripharbor_token')

  if (!token) {
    throw new Error('Please log in.')
  }

  return apiRequest<{
    message: string
    data: {
      id: string
      status: 'CANCELLED'
      cancellationReason: string
    }
  }>(`/api/trips/${encodeURIComponent(tripId)}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  })
}
