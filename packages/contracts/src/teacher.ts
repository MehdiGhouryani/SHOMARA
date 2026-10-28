export type TeacherApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TeacherApplicationSubmission {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  schoolName: string;
  city: string;
  notes?: string | null;
}

export interface TeacherApplicationRecord {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  schoolName: string;
  city: string;
  notes?: string | null;
  status: TeacherApplicationStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewerAccountId?: string | null;
  rejectionReason?: string | null;
}

export interface TeacherAuthCredentials {
  username: string;
  password?: string;
}

export interface TeacherSessionInfo {
  authenticated: boolean;
  accountId?: string;
  username?: string;
  displayName?: string;
  roles: string[];
  isTeacher: boolean;
}

export interface TeacherAuthResponse {
  success: boolean;
  message?: string;
  session?: TeacherSessionInfo;
  accessToken?: string;
}
