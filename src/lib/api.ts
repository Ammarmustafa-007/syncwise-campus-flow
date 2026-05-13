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
const FAKE_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), FAKE_LATENCY_MS));
}

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

// Helper for the future real implementation — kept here so swapping is one line.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _realRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
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
  semester_label: string;
  version_label: string;
  uploader_name: string;
  uploaded_at: string;
  slots_count: number;
  needs_review_count: number;
  is_latest: boolean;
  university: { name: string };
  department: { name: string; code: string };
  sections_found: string[];
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "student" | "teacher";
  plan: "free" | "pro";
  university_id: string;
  created_at: string;
}
export interface UsersResponse { users: AdminUser[]; total: number; page: number; limit: number; }
export interface UserSchedule { enrolled_slots: { subject: string; section: string; day: string; start_time: string; end_time: string; room_name: string }[]; total_slots: number; }
export interface UserSections { sections: { section_id: string; section_name: string }[]; }

// =============================================================================
// Mock data
// =============================================================================
const universities: University[] = [
  { id: "uni-001", name: "FAST NUCES Islamabad", city: "Islamabad", country: "Pakistan" },
  { id: "uni-002", name: "NUST", city: "Islamabad", country: "Pakistan" },
  { id: "uni-003", name: "LUMS", city: "Lahore", country: "Pakistan" },
];

const departments: Department[] = [
  { id: "dep-001", name: "Computer Science", code: "CS", university_id: "uni-001" },
  { id: "dep-002", name: "Software Engineering", code: "SE", university_id: "uni-001" },
  { id: "dep-003", name: "Electrical Engineering", code: "EE", university_id: "uni-001" },
  { id: "dep-004", name: "Artificial Intelligence", code: "AI", university_id: "uni-001" },
  { id: "dep-005", name: "Computer Science", code: "CS", university_id: "uni-002" },
];

const versions: VersionRow[] = [
  {
    id: "v-001",
    semester_label: "Fall 2025",
    version_label: "Final",
    uploader_name: "Dr. Sarah Ahmed",
    uploaded_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
    slots_count: 412,
    needs_review_count: 3,
    is_latest: true,
    university: { name: "FAST NUCES Islamabad" },
    department: { name: "Computer Science", code: "CS" },
    sections_found: ["BSCS-1A", "BSCS-1B", "BSCS-2A", "BSCS-2B", "BSCS-3A", "BSCS-4A"],
  },
  {
    id: "v-002",
    semester_label: "Fall 2025",
    version_label: "v2",
    uploader_name: "Dr. Sarah Ahmed",
    uploaded_at: new Date(Date.now() - 5 * 86400_000).toISOString(),
    slots_count: 408,
    needs_review_count: 12,
    is_latest: false,
    university: { name: "FAST NUCES Islamabad" },
    department: { name: "Computer Science", code: "CS" },
    sections_found: ["BSCS-1A", "BSCS-1B", "BSCS-2A", "BSCS-2B", "BSCS-3A"],
  },
  {
    id: "v-003",
    semester_label: "Fall 2025",
    version_label: "v1",
    uploader_name: "Prof. Asif Khan",
    uploaded_at: new Date(Date.now() - 14 * 86400_000).toISOString(),
    slots_count: 198,
    needs_review_count: 0,
    is_latest: true,
    university: { name: "FAST NUCES Islamabad" },
    department: { name: "Software Engineering", code: "SE" },
    sections_found: ["BSSE-1A", "BSSE-2A", "BSSE-3A"],
  },
  {
    id: "v-004",
    semester_label: "Spring 2025",
    version_label: "Final",
    uploader_name: "Dr. Sarah Ahmed",
    uploaded_at: new Date(Date.now() - 120 * 86400_000).toISOString(),
    slots_count: 386,
    needs_review_count: 0,
    is_latest: false,
    university: { name: "FAST NUCES Islamabad" },
    department: { name: "Computer Science", code: "CS" },
    sections_found: ["BSCS-1A", "BSCS-2A", "BSCS-3A", "BSCS-4A"],
  },
];

const firstNames = ["Ali", "Ayesha", "Hamza", "Fatima", "Bilal", "Zainab", "Usman", "Hira", "Saad", "Mariam", "Faisal", "Sana", "Omar", "Iqra", "Talha"];
const lastNames = ["Khan", "Ahmed", "Raza", "Iqbal", "Malik", "Hussain", "Siddiqui", "Sheikh", "Butt", "Chaudhry"];
function genUsers(): AdminUser[] {
  const arr: AdminUser[] = [
    { id: "u-admin-1", full_name: "Dr. Sarah Ahmed", email: "admin@syncwise.com", role: "admin", plan: "pro", university_id: "uni-001", created_at: new Date(Date.now() - 200 * 86400_000).toISOString() },
  ];
  for (let i = 0; i < 24; i++) {
    arr.push({
      id: `u-t-${i}`,
      full_name: `${firstNames[i % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
      email: `teacher${i}@fast.edu.pk`,
      role: "teacher",
      plan: "pro",
      university_id: "uni-001",
      created_at: new Date(Date.now() - (30 + i) * 86400_000).toISOString(),
    });
  }
  for (let i = 0; i < 86; i++) {
    arr.push({
      id: `u-s-${i}`,
      full_name: `${firstNames[(i * 2) % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      email: `student${i}@fast.edu.pk`,
      role: "student",
      plan: i % 4 === 0 ? "pro" : "free",
      created_at: new Date(Date.now() - i * 86400_000).toISOString(),
      university_id: "uni-001",
    });
  }
  return arr;
}
const users: AdminUser[] = genUsers();

// =============================================================================
// API surface
// =============================================================================

// GET /api/admin/stats
export async function getStats(): Promise<AdminStats> {
  const total_students = users.filter((u) => u.role === "student").length;
  return delay({
    total_users: users.length,
    total_students,
    total_teachers: users.filter((u) => u.role === "teacher").length,
    free_plan_students: users.filter((u) => u.role === "student" && u.plan === "free").length,
    pro_plan_students: users.filter((u) => u.role === "student" && u.plan === "pro").length,
    total_versions: versions.length,
  });
}

// GET /api/admin/universities
export async function getUniversities(): Promise<University[]> {
  return delay([...universities]);
}

// POST /api/admin/universities
export async function createUniversity(input: { name: string; city: string; country: string }): Promise<University> {
  const u: University = { id: `uni-${Date.now()}`, ...input };
  universities.push(u);
  return delay(u);
}

// GET /api/admin/departments?university_id=X
export async function getDepartments(university_id: string): Promise<Department[]> {
  return delay(departments.filter((d) => d.university_id === university_id));
}

// POST /api/admin/departments
export async function createDepartment(input: { name: string; code: string; university_id: string }): Promise<Department> {
  const d: Department = { id: `dep-${Date.now()}`, ...input };
  departments.push(d);
  return delay(d);
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
  await new Promise((r) => setTimeout(r, 1800));
  if (form.pdf.name.toLowerCase().includes("duplicate")) {
    return { status: "already_parsed", version_id: "v-001", semester_label: form.semester_label, version_label: form.version_label };
  }
  const uni = universities.find((u) => u.id === form.university_id);
  const dep = departments.find((d) => d.id === form.department_id);
  const id = `v-${Date.now()}`;
  const sections = ["BSCS-1A", "BSCS-1B", "BSCS-2A", "BSCS-2B", "BSCS-3A"];
  versions.forEach((v) => {
    if (v.university.name === uni?.name && v.department.code === dep?.code) v.is_latest = false;
  });
  const newVersion: VersionRow = {
    id,
    semester_label: form.semester_label,
    version_label: form.version_label,
    uploader_name: form.uploader_name,
    uploaded_at: new Date().toISOString(),
    slots_count: 380 + Math.floor(Math.random() * 50),
    needs_review_count: Math.floor(Math.random() * 6),
    is_latest: true,
    university: { name: uni?.name ?? "Unknown" },
    department: { name: dep?.name ?? "Unknown", code: dep?.code ?? "?" },
    sections_found: sections,
  };
  versions.unshift(newVersion);
  return {
    status: "success",
    version_id: id,
    semester_label: form.semester_label,
    version_label: form.version_label,
    uploader_name: form.uploader_name,
    slots_count: newVersion.slots_count,
    needs_review_count: newVersion.needs_review_count,
    sections_found: sections.map((name) => ({ name })),
    university_name: newVersion.university.name,
    department_name: newVersion.department.name,
    uploaded_at: newVersion.uploaded_at,
  };
}

// GET /api/admin/versions
export async function getVersions(): Promise<VersionRow[]> {
  return delay([...versions].sort((a, b) => +new Date(b.uploaded_at) - +new Date(a.uploaded_at)));
}

// PATCH /api/admin/versions/:id/set-latest
export async function setLatestVersion(id: string): Promise<{ status: "updated"; version_id: string }> {
  const target = versions.find((v) => v.id === id);
  if (target) {
    versions.forEach((v) => {
      if (v.university.name === target.university.name && v.department.code === target.department.code) {
        v.is_latest = v.id === id;
      }
    });
  }
  return delay({ status: "updated" as const, version_id: id });
}

// GET /api/admin/users
export async function getUsers(params: { page?: number; limit?: number; role?: string; plan?: string; search?: string } = {}): Promise<UsersResponse> {
  const { page = 1, limit = 20, role = "", plan = "", search = "" } = params;
  let filtered = [...users];
  if (role) filtered = filtered.filter((u) => u.role === role);
  if (plan) filtered = filtered.filter((u) => u.plan === plan);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  const total = filtered.length;
  const start = (page - 1) * limit;
  return delay({ users: filtered.slice(start, start + limit), total, page, limit });
}

// GET /api/admin/users/:id/schedule
export async function getUserSchedule(_id: string): Promise<UserSchedule> {
  return delay({
    enrolled_slots: [
      { subject: "Data Structures", section: "BSCS-2A", day: "Mon", start_time: "08:30", end_time: "10:00", room_name: "CS-101" },
      { subject: "Database Systems", section: "BSCS-2A", day: "Tue", start_time: "10:30", end_time: "12:00", room_name: "CS-204" },
      { subject: "Linear Algebra", section: "BSCS-2A", day: "Wed", start_time: "14:00", end_time: "15:30", room_name: "MATH-12" },
      { subject: "Operating Systems", section: "BSCS-2A", day: "Thu", start_time: "08:30", end_time: "10:00", room_name: "CS-101" },
    ],
    total_slots: 4,
  });
}

// GET /api/admin/users/:id/sections
export async function getUserSections(_id: string): Promise<UserSections> {
  return delay({
    sections: [
      { section_id: "sec-1", section_name: "BSCS-2A" },
      { section_id: "sec-2", section_name: "BSCS-3B" },
    ],
  });
}

// PATCH /api/admin/users/:id  (role/plan changes)
export async function updateUser(id: string, patch: Partial<Pick<AdminUser, "role" | "plan">>): Promise<AdminUser> {
  const u = users.find((x) => x.id === id);
  if (!u) throw new Error("User not found");
  Object.assign(u, patch);
  return delay({ ...u });
}
