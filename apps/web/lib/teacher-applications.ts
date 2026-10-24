import { randomUUID } from 'node:crypto';
import type { TeacherApplicationRecord, TeacherApplicationSubmission, TeacherApplicationStatus } from '@math/contracts';
import { toEnglishDigits } from './persian';

export class TeacherApplicationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeacherApplicationValidationError';
  }
}

export interface TeacherApplicationRepository {
  create(submission: TeacherApplicationSubmission): Promise<TeacherApplicationRecord>;
  findById(id: string): Promise<TeacherApplicationRecord | null>;
  findByPhone(phone: string): Promise<TeacherApplicationRecord[]>;
  list(filter?: { status?: TeacherApplicationStatus }): Promise<TeacherApplicationRecord[]>;
  updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerAccountId: string,
    rejectionReason?: string
  ): Promise<TeacherApplicationRecord>;
}

export function validateAndNormalizeTeacherApplication(
  input: unknown
): TeacherApplicationSubmission {
  if (!input || typeof input !== 'object') {
    throw new TeacherApplicationValidationError('PAYLOAD_INVALID: اطلاعات ورودی معتبر نیست.');
  }

  const raw = input as Record<string, unknown>;

  const firstName = typeof raw.firstName === 'string' ? raw.firstName.trim() : '';
  const lastName = typeof raw.lastName === 'string' ? raw.lastName.trim() : '';
  const rawPhone = typeof raw.phoneNumber === 'string' ? raw.phoneNumber.trim() : (typeof raw.phone === 'string' ? raw.phone.trim() : '');
  const schoolName = typeof raw.schoolName === 'string' ? raw.schoolName.trim() : '';
  const city = typeof raw.city === 'string' ? raw.city.trim() : '';
  const notes = typeof raw.notes === 'string' ? raw.notes.trim() : (typeof raw.description === 'string' ? raw.description.trim() : null);

  if (!firstName || firstName.length < 2 || firstName.length > 60) {
    throw new TeacherApplicationValidationError('FIRST_NAME_REQUIRED: لطفاً نام خود را به درستی وارد کنید.');
  }

  if (!lastName || lastName.length < 2 || lastName.length > 60) {
    throw new TeacherApplicationValidationError('LAST_NAME_REQUIRED: لطفاً نام خانوادگی را به درستی وارد کنید.');
  }

  // Convert Persian / Arabic numerals to standard ASCII digits
  const normalizedPhone = toEnglishDigits(rawPhone).replace(/[\s\-]/g, '');

  // Must be a valid mobile phone (e.g., 09xxxxxxxxx or international format +989...)
  const isPhoneValid = /^(09\d{9}|\+989\d{9}|9\d{9})$/.test(normalizedPhone);
  if (!isPhoneValid) {
    throw new TeacherApplicationValidationError('PHONE_INVALID: لطفاً یک شماره تلفن همراه معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
  }

  // Standardize phone to 09xxxxxxxxx
  const standardPhone = normalizedPhone.startsWith('+98')
    ? '0' + normalizedPhone.slice(3)
    : normalizedPhone.startsWith('9') && normalizedPhone.length === 10
      ? '0' + normalizedPhone
      : normalizedPhone;

  if (!schoolName || schoolName.length < 3 || schoolName.length > 100) {
    throw new TeacherApplicationValidationError('SCHOOL_NAME_REQUIRED: لطفاً نام مدرسه یا مرکز آموزشی را وارد کنید.');
  }

  if (!city || city.length < 2 || city.length > 60) {
    throw new TeacherApplicationValidationError('CITY_REQUIRED: لطفاً شهر یا منطقه آموزشی را وارد کنید.');
  }

  if (notes && notes.length > 500) {
    throw new TeacherApplicationValidationError('NOTES_TOO_LONG: متن توضیحات حداکثر ۵۰۰ کاراکتر است.');
  }

  return {
    firstName,
    lastName,
    phoneNumber: standardPhone,
    schoolName,
    city,
    notes: notes || null,
  };
}

class InMemoryTeacherApplicationRepository implements TeacherApplicationRepository {
  private readonly applications = new Map<string, TeacherApplicationRecord>();

  async create(submission: TeacherApplicationSubmission): Promise<TeacherApplicationRecord> {
    const record: TeacherApplicationRecord = {
      id: randomUUID(),
      firstName: submission.firstName,
      lastName: submission.lastName,
      phoneNumber: submission.phoneNumber,
      schoolName: submission.schoolName,
      city: submission.city,
      notes: submission.notes || null,
      status: 'PENDING', // Rule: Initial status is strictly PENDING
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerAccountId: null,
      rejectionReason: null,
    };

    this.applications.set(record.id, record);
    return record;
  }

  async findById(id: string): Promise<TeacherApplicationRecord | null> {
    const found = this.applications.get(id);
    return found ? { ...found } : null;
  }

  async findByPhone(phone: string): Promise<TeacherApplicationRecord[]> {
    return Array.from(this.applications.values())
      .filter((app) => app.phoneNumber === phone)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async list(filter?: { status?: TeacherApplicationStatus }): Promise<TeacherApplicationRecord[]> {
    const list = Array.from(this.applications.values());
    if (filter?.status) {
      return list.filter((app) => app.status === filter.status);
    }
    return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerAccountId: string,
    rejectionReason?: string
  ): Promise<TeacherApplicationRecord> {
    const app = this.applications.get(id);
    if (!app) {
      throw new Error('APPLICATION_NOT_FOUND');
    }

    const updated: TeacherApplicationRecord = {
      ...app,
      status,
      reviewerAccountId,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null,
    };

    this.applications.set(id, updated);
    return { ...updated };
  }
}

// Singleton repository for runtime
export const teacherApplicationRepository: TeacherApplicationRepository =
  new InMemoryTeacherApplicationRepository();
