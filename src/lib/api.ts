// =============================================================================
// SyncWise Admin API client
//
// TODO: BACKEND
// Replace each function body below with a real `fetch()` call to your
// Node/Express backend. The shape of each response matches the spec exactly,
// so the UI will keep working when the mock layer is removed.
//
// Auth: every call should send `Authorization: Bearer <supabase token>`.
// `getAuthToken()` returns the token from the AuthProvider's localStorage.
// =============================================================================

import type { AuthUser } from "./auth";

const STORAGE_KEY = "syncwise_auth_user";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as AuthUser).token;
  } catch {
    return null;
  }
}

// Global request cache to optimize navigation and reduce server load
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// Helper for the future real implementation — kept here so swapping is one line.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _realRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isGet = !init.method || init.method.toUpperCase() === "GET";
  const cacheKey = path;

  // Serve from cache if valid
  if (isGet && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  const token = getAuthToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error ?? `Request failed: ${res.status}`);
  }

  const body = await res.json();

  // Store in cache or invalidate
  if (isGet) {
    requestCache.set(cacheKey, { data: body, timestamp: Date.now() });
  } else {
    // Clear entire cache on any mutation to ensure fresh data across the app
    requestCache.clear();
  }

  return body as T;
}

// =============================================================================
// Types
// =============================================================================
export interface AdminStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  free_plan_students: number;
  pro_plan_students: number;
  total_versions: number;
}
export interface University { id: string; name: string; city: string; country: string; }
export interface Department { id: string; name: string; code: string; university_id: string; }
export interface UploadResultSuccess {
  status: "success";
  version_id: string;
  semester_label: string;
  version_label: string;
  uploader_name: string;
  slots_count: number;
  needs_review_count: number;
  sections_found: { name: string }[];
  needs_review_slots?: any[];
  university_name: string;
  department_name: string;
  uploaded_at: string;
}
export interface UploadResultDuplicate {
  status: "already_parsed";
  version_id: string;
  semester_label: string;
  version_label: string;
}
export type UploadResult = UploadResultSuccess | UploadResultDuplicate;

export interface VersionRow {
  id: string;
  department_id: string;
  semester_label: string;
  version_label: string;
  uploader_name: string;
  uploaded_at: string;
  is_latest: boolean;
  slots_count: number;
  needs_review_count: number;
  total_semesters?: number;
  university: { name: string };
  department: { name: string; code: string };
  sections_found: string[];
  needs_review_slots?: any[];
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "student" | "teacher";
  plan: "free" | "pro";
  pro_request_status?: "none" | "pending";
  university_id: string;
  created_at: string;
}
export interface UsersResponse { users: AdminUser[]; total: number; page: number; limit: number; }
export interface UserSchedule { enrolled_slots: { subject: string; section: string; day: string; start_time: string; end_time: string; room_name: string }[]; total_slots: number; }
export interface UserSections { sections: { section_id: string; section_name: string }[]; }

// =============================================================================
// API surface
// =============================================================================

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// GET /api/admin/stats
export async function getStats(): Promise<AdminStats> {
  return _realRequest<AdminStats>(`${API_BASE}/admin/stats`);
}

// GET /api/admin/universities
export async function getUniversities(): Promise<University[]> {
  return _realRequest<University[]>(`${API_BASE}/admin/universities`);
}

// POST /api/admin/universities
export async function createUniversity(input: { name: string; city: string; country: string }): Promise<University> {
  return _realRequest<University>(`${API_BASE}/admin/universities`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// GET /api/admin/departments?university_id=X
export async function getDepartments(university_id: string): Promise<Department[]> {
  return _realRequest<Department[]>(`${API_BASE}/admin/departments?university_id=${university_id}`);
}

// POST /api/admin/departments
export async function createDepartment(input: { name: string; code: string; university_id: string }): Promise<Department> {
  return _realRequest<Department>(`${API_BASE}/admin/departments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// POST /api/admin/upload
export async function uploadTimetable(form: {
  pdf: File;
  semester_label: string;
  version_label: string;
  uploader_name: string;
  university_id: string;
  department_id: string;
}): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", form.pdf);
  fd.append("semester_label", form.semester_label);
  fd.append("version_label", form.version_label);
  fd.append("uploader_name", form.uploader_name);
  fd.append("university_id", form.university_id);
  fd.append("department_id", form.department_id);

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMessage = err.details ? `${err.error}: ${err.details}` : (err.error || "Upload failed");
    throw new Error(errorMessage);
  }
  
  const data = await res.json();
  if (data.status === 'already_parsed') {
    return { status: "already_parsed", version_id: data.version_id, semester_label: form.semester_label, version_label: form.version_label };
  }

  return {
    status: "success",
    version_id: data.version_id,
    semester_label: form.semester_label,
    version_label: form.version_label,
    uploader_name: form.uploader_name,
    slots_count: data.summary.total_slots,
    needs_review_count: data.summary.needs_review_count,
    sections_found: data.summary.sections_found.map((s: string) => ({ name: s })),
    needs_review_slots: data.needs_review_slots || [],
    university_name: "Mapped University", // The backend doesn't return this yet
    department_name: "Mapped Department",
    uploaded_at: new Date().toISOString(),
  };
}

// GET /api/admin/versions
export async function getVersions(): Promise<VersionRow[]> {
  return _realRequest<VersionRow[]>(`${API_BASE}/admin/versions`);
}

// GET /api/admin/versions/:id/flagged
export async function getFlaggedSlots(versionId: string): Promise<any[]> {
  return _realRequest<any[]>(`${API_BASE}/admin/versions/${versionId}/flagged`);
}

// GET /api/admin/versions/:id/sections
export async function getVersionSections(id: string): Promise<string[]> {
  return _realRequest<string[]>(`${API_BASE}/admin/versions/${id}/sections`);
}

// PATCH /api/admin/versions/:id/set-latest
export async function setLatestVersion(id: string): Promise<{ status: "updated"; version_id: string }> {
  return _realRequest<{ status: "updated"; version_id: string }>(`${API_BASE}/admin/versions/${id}/set-latest`, { method: "PATCH" });
}

// DELETE /api/admin/versions/:id
export async function deleteVersion(id: string): Promise<{ status: "deleted" }> {
  return _realRequest<{ status: "deleted" }>(`${API_BASE}/admin/versions/${id}`, { method: "DELETE" });
}

// GET /api/admin/users
export async function getUsers(params: { page?: number; limit?: number; role?: string; plan?: string; search?: string } = {}): Promise<UsersResponse> {
  const query = new URLSearchParams(params as any).toString();
  return _realRequest<UsersResponse>(`${API_BASE}/admin/users?${query}`);
}

// GET /api/admin/users/:id/schedule
export async function getUserSchedule(id: string): Promise<UserSchedule> {
  return _realRequest<UserSchedule>(`${API_BASE}/admin/users/${id}/schedule`);
}

// GET /api/admin/users/:id/sections
export async function getUserSections(id: string): Promise<UserSections> {
  return _realRequest<UserSections>(`${API_BASE}/admin/users/${id}/sections`);
}

// PATCH /api/admin/users/:id  (role/plan changes)
export async function updateUser(id: string, patch: Partial<Pick<AdminUser, "role" | "plan">>): Promise<AdminUser> {
  return _realRequest<AdminUser>(`${API_BASE}/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
