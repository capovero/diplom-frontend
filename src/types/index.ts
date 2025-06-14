// src/types/index.ts

// ======= User =======
export interface UserResponse {
  id: string;
  userName: string;
  email: string;
}

export interface UserProfileResponse extends UserResponse {
  role: string;
  projects: ProjectResponse[];
}

export interface AdminProfileResponse extends UserProfileResponse {
  role: string;
}

// ======= Project =======
export interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  collectedAmount: number;
  createdAt: string;          // ISO-строка
  categoryName?: string;
  status: string;             // "Pending" | "Active" | "Completed" и т. д.
  mediaFiles: string[];       // пути к файлам или URL
  averageRating: number | null;
  creator: UserResponse;
}

export interface ProjectPaginationResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  data: ProjectResponse[];
}

// ======= Donation =======
export interface DonationResponse {
  id: number;
  amount: number;
  donateAt: string; // ISO-строка
  projectId: number;
  projectTitle: string;
  userId: string;
}

export interface AdminDonationResponse extends DonationResponse {
  userName: string;
  userEmail: string;
}

export interface DonationUser {
  amount: number;
  donateAt: string;           // ISO-строка
  projectTitle: string;
}

// ======= Review =======
export interface ReviewResponse {
  id: number;
  projectId: number;
  rating: number;
  comment: string;
  userName: string;
  projectName: string;
}

// ======= Category =======
export interface CategoryDto {
  id: number;
  name: string;
}

// ======= Update =======
export interface UpdateResponse {
  id: number;
  content: string;
  createdAt: string;          // ISO-строка
}
