
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Education {
  titleOfCertification: string;
  typeOfCertification: string;
  fieldOfCertification: string;
  institution: string;
  yearOfPassing: string;
  gpaOrGrade: string;
  certificateFile?: string; // Assuming file path/name
}

export interface Experience {
  companyName: string;
  designation: string;
  annualCTC: number;
  fromDate: string;
  toDate: string;
  reasonForLeaving: string;
  experienceLetter?: string;
  last3MonthPayslip?: string;
  resume?: string;
}

export interface Reference {
  referenceName: string;
  company: string;
  designation: string;
  contactNumber: string;
}

export interface Compensation {
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  ctc: number;
  costPerHour: number;
}


export interface Employee {
  id: string;
  name: string;
  email: string; // Official Email
  personalEmail: string;
  employeeId: string;
  designation: string;
  department: string;
  status: 'Active' | 'Resigned' | 'Absconded' | 'Terminated' | 'Transferred';
  avatar: string;
  // Detailed fields for edit tabs
  firstName: string;
  lastName: string;
  organization: string;
  orgDateOfJoining: string; // Organization DOJ
  ksaEmploymentJoining: string; // KSA DOJ
  category: string;
  reportingTo: string;
  countryCode: string;
  phoneNumber: string;
  alternateContact: string;
  nationality: string;
  employmentType: string;
  gender: 'Male' | 'Female' | 'Other';
  skills: string[];
  personalDetails: {
    dateOfBirth: string; // DOB (Certificate)
    dobOriginal: string; // DOB (Original)
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    fatherOrSpouseName: string;
    bloodGroup: string;
    residentialAddress: string;
    permanentAddress: string;
    emergencyContactNumber: string;
    relation: string;
    contactNumber: string;
  };
  education: Education[];
  experience: Experience[];
  references: Reference[];
  identification: {
    aadharNumber: string;
    panNumber: string;
    drivingLicenseNumber: string;
    licenseValidUpTo: string;
    passportNumber: string;
    passportValidUpTo: string;
    visaType: string;
    visaNumber: string;
    visaValidUpTo: string;
    sponsor: string;
  };
  compensation: Compensation;
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
    passbookCopy?: string;
    bankProfileImage?: string;
    offerLetter?: string;
    transferLetter?: string;
  };
}


@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/employees';

  private readonly _employees = signal<Employee[]>([]);

  public readonly employees = this._employees.asReadonly();

  constructor() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<Employee[]>(this.apiUrl).subscribe({
      next: (employees) => this._employees.set(employees),
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  addEmployee(employeeData: Partial<Employee>): void {
    const newEmployee: Employee = {
      id: employeeData.id || `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Fallback ID if not provided, though backend should ideally handle ID generation if strict formats are needed. The DB schema uses string ID.
      name: `${employeeData.firstName} ${employeeData.lastName}`,
      email: employeeData.email || '',
      personalEmail: '',
      employeeId: employeeData.employeeId || '',
      designation: employeeData.designation || '',
      department: employeeData.department || '',
      status: (employeeData.status as any) || 'Active',
      avatar: `https://picsum.photos/seed/${employeeData.id}/200/200`, // Placeholder avatar
      firstName: employeeData.firstName || '',
      lastName: employeeData.lastName || '',
      organization: '',
      orgDateOfJoining: employeeData.orgDateOfJoining || '',
      ksaEmploymentJoining: employeeData.ksaEmploymentJoining || '',
      category: employeeData.category || '',
      reportingTo: employeeData.reportingTo || '',
      countryCode: employeeData.countryCode || '+91',
      phoneNumber: employeeData.phoneNumber || '',
      alternateContact: '',
      nationality: employeeData.nationality || '',
      employmentType: employeeData.employmentType || 'Full-time',
      gender: 'Male',
      skills: [],
      personalDetails: {
        dateOfBirth: '', dobOriginal: '', maritalStatus: 'Single', fatherOrSpouseName: '', bloodGroup: '',
        residentialAddress: '', permanentAddress: '', emergencyContactNumber: '', relation: '', contactNumber: ''
      },
      education: [], experience: [], references: [],
      identification: {
        aadharNumber: '', panNumber: '', drivingLicenseNumber: '', licenseValidUpTo: '', passportNumber: '',
        passportValidUpTo: '', visaType: '', visaNumber: '', visaValidUpTo: '', sponsor: ''
      },
      compensation: { basicSalary: 0, hra: 0, otherAllowances: 0, ctc: 0, costPerHour: 0 },
      bankDetails: { bankName: '', branchName: '', accountNumber: '', ifscCode: '' }
    };

    this.http.post<Employee>(this.apiUrl, newEmployee).subscribe({
      next: (createdEmployee) => {
        this._employees.update(employees => [...employees, createdEmployee]);
      },
      error: (err) => console.error('Error adding employee:', err)
    });
  }

  deleteEmployee(employeeId: string): void {
    this.http.delete(`${this.apiUrl}/${employeeId}`).subscribe({
      next: () => {
        this._employees.update(employees => employees.filter(e => e.id !== employeeId));
      },
      error: (err) => console.error('Error deleting employee:', err)
    });
  }

  updateEmployee(updatedEmployee: Employee): void {
    this.http.put<Employee>(`${this.apiUrl}/${updatedEmployee.id}`, updatedEmployee).subscribe({
      next: (savedEmployee) => {
        this._employees.update(employees =>
          employees.map(emp => emp.id === savedEmployee.id ? savedEmployee : emp)
        );
      },
      error: (err) => console.error('Error updating employee:', err)
    });
  }
}

// --- SHIFT SERVICE ---

export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  assignedEmployees: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private readonly _shifts = signal<Shift[]>([
    { id: 1, name: 'Morning Shift', startTime: '09:00', endTime: '17:00', assignedEmployees: ['John Doe', 'Jane Smith'] },
    { id: 2, name: 'Evening Shift', startTime: '17:00', endTime: '01:00', assignedEmployees: ['Susan Wilson'] },
    { id: 3, name: 'Night Shift', startTime: '01:00', endTime: '09:00', assignedEmployees: ['Allyce Brown'] }
  ]);
  private _nextId = signal(4);

  public readonly shifts = this._shifts.asReadonly();

  addShift(data: { name: string, startTime: string, endTime: string }) {
    const newShift: Shift = {
      id: this._nextId(),
      ...data,
      assignedEmployees: []
    };
    this._shifts.update(shifts => [...shifts, newShift]);
    this._nextId.update(id => id + 1);
  }

  updateShift(updatedShift: Omit<Shift, 'assignedEmployees'>) {
    this._shifts.update(shifts =>
      shifts.map(s => s.id === updatedShift.id ? { ...s, ...updatedShift } : s)
    );
  }

  deleteShift(id: number) {
    this._shifts.update(shifts => shifts.filter(s => s.id !== id));
  }
}


// --- ATTENDANCE SERVICE ---

export interface AttendanceRecord {
  id: number;
  employeeId: string;
  checkIn: Date;
  checkOut: Date | null;
  location: string;
  locationType: 'Office' | 'Project site' | 'Remote';
  shift: string;
  date: string; // YYYY-MM-DD
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private _records = signal<AttendanceRecord[]>([]);
  private _nextId = signal(1);

  public readonly records = this._records.asReadonly();

  hasCheckedInToday(employeeId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.records().some(r => r.employeeId === employeeId && r.date === today);
  }

  checkIn(data: { employeeId: string, location: string, locationType: 'Office' | 'Project site' | 'Remote', shift: string }): void {
    if (this.hasCheckedInToday(data.employeeId)) {
      console.error('User has already checked in today.');
      throw new Error('You have already checked in for today. Multiple check-ins on the same day are not allowed.');
    }

    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: this._nextId(),
      employeeId: data.employeeId,
      checkIn: now,
      checkOut: null,
      location: data.location,
      locationType: data.locationType,
      shift: data.shift,
      date: now.toISOString().split('T')[0],
    };
    this._records.update(records => [...records, newRecord]);
    this._nextId.update(id => id + 1);
  }

  checkOut(employeeId: string): void {
    const now = new Date();
    this._records.update(records =>
      records.map(record => {
        if (record.employeeId === employeeId && record.checkOut === null) {
          return { ...record, checkOut: now };
        }
        return record;
      })
    );
  }

  getActiveCheckin(employeeId: string): AttendanceRecord | undefined {
    return this._records().find(r => r.employeeId === employeeId && r.checkOut === null);
  }
}

// --- LEAVE SERVICE ---

export interface LeaveRequest {
  id: number;
  employeeId: string;
  leaveType: string;
  leaveRange: 'One Day' | 'More Than a Day';
  date?: string; // YYYY-MM-DD for single day
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly _leaveRequests = signal<LeaveRequest[]>([
    { id: 1, employeeId: 'EMP003', leaveType: 'Vacation', leaveRange: 'More Than a Day', fromDate: '2025-12-10', toDate: '2025-12-15', reason: 'Family trip', status: 'Approved', appliedOn: new Date('2025-11-20') },
    { id: 2, employeeId: 'EMP004', leaveType: 'Sick Leave', leaveRange: 'One Day', date: '2025-12-16', reason: 'Fever', status: 'Approved', appliedOn: new Date('2025-12-16') },
  ]);
  public readonly leaveRequests = this._leaveRequests.asReadonly();

  getOnLeaveEmployeeIdsForDate(date: string): string[] {
    const onLeave = new Set<string>();

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    this.leaveRequests().forEach(req => {
      if (req.status === 'Approved') {
        if (req.leaveRange === 'One Day' && req.date) {
          const reqDate = new Date(req.date);
          reqDate.setUTCHours(0, 0, 0, 0);
          if (reqDate.getTime() === targetDate.getTime()) {
            onLeave.add(req.employeeId);
          }
        } else if (req.leaveRange === 'More Than a Day' && req.fromDate && req.toDate) {
          const from = new Date(req.fromDate);
          from.setUTCHours(0, 0, 0, 0);
          const to = new Date(req.toDate);
          to.setUTCHours(0, 0, 0, 0);
          if (targetDate >= from && targetDate <= to) {
            onLeave.add(req.employeeId);
          }
        }
      }
    });
    return Array.from(onLeave);
  }
}
