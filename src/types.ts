/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  data: string;
  key?: string;
}

export interface RecycleBinItem {
  id: string;
  sourceType: string;
  title: string;
  fileName: string;
  fileType: string;
  fileData: string;
  deletedAt: string;
  originalPath: {
    employeeId?: string;
    docKey?: string;
    attendanceId?: string;
    logData?: string;
  };
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'debit' | 'investment' | 'expense';
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;
}

export interface Employee {
  id: string;
  role?: 'employee' | 'manager' | 'md' | 'director';
  name: string;
  status: 'approved' | 'pending' | 'revoked';
  registeredAt: string;
  avatarUrl?: string;
  phoneNumber?: string;
  password?: string;
  esic?: string;
  epfo?: string;
  aadhar?: string;
  pan?: string;
  passport?: string;
  resume?: string;
  studyCertificate?: string;
  bankPassbook?: string;
  leaveCert?: string;
  address?: string;
  offerLetter?: string;
  familyDetails?: string;
  isResigned?: boolean;
  leaveBalance: {
    casual: number;
    sick: number;
    annual: number;
    documents?: string[];
  };
  uploadedFilesList?: DocumentFile[];
  panKycStatus?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockLevel: number;
  minThreshold: number;
  unit: string;
  warehouse: string;
  lastUpdated: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  timing: string;
  status: 'scheduled' | 'inprogress' | 'completed';
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  monthYear: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'unpaid';
  deliveredAt: string;
}

export interface PayslipFormat {
  companyName: string;
  companyAddress: string;
  logoUrl: string;
  authorizedSignatory: string;
  themeColor: string;
  notes: string;
}

export interface HrUser {
  id: string;
  password?: string;
  phoneNumber: string;
  verified: boolean;
  isParentVerified: boolean;
}

export interface EmployeeHelpQuery {
  id: string;
  employeeId: string;
  employeeName: string;
  projectName: string;
  priority: 'normal' | 'urgent';
  queryText: string;
  attachment?: string | null;
  submittedAt: string;
  hrResponse?: string;
  hrRespondedAt?: string;
  status: 'pending' | 'resolved';
  onUpdateEmployeeQueries?: (queries: EmployeeHelpQuery[]) => void;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'word' | 'excel' | 'pdf' | 'image' | 'other';
  downloadUrl?: string;
  storagePath?: string;
  createdAt: string;
}
