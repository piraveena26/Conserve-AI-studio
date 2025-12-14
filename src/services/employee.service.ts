
import { Injectable, signal } from '@angular/core';

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
  lastName:string;
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
export class EmployeeService {
  private readonly _employees = signal<Employee[]>([
     { 
      id: 'EMP001', name: 'Thavarasha Kunaraj', email: 'thava@conserve.com', employeeId: '1106', 
      designation: 'Assistant Manager', department: 'KSA-Administration - Conserve Solutions', status: 'Active', 
      avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&q=80',
      firstName: 'Thavarasha', lastName: 'Kunaraj', organization: 'org1', orgDateOfJoining: '2020-12-26',
      ksaEmploymentJoining: '2022-12-27', category: 'Trainee', reportingTo: 'EMP002', // Venkatesh S
      countryCode: '+91', phoneNumber: '123-456-7890', alternateContact: '098-765-4321', nationality: 'Indian', employmentType: 'Full-time',
      gender: 'Male',
      personalEmail: 'thava@personal.com',
      skills: ['Angular', 'TypeScript', 'Node.js'],
      personalDetails: { 
        dateOfBirth: '1998-09-05', 
        dobOriginal: '1999-01-01', 
        maritalStatus: 'Single', 
        permanentAddress: '123 Main St, Anytown, USA',
        fatherOrSpouseName: 'Kunaraj',
        bloodGroup: 'O+',
        residentialAddress: '456 Oak Ave, Anytown, USA',
        emergencyContactNumber: '111-222-3333',
        relation: 'Father',
        contactNumber: '444-555-6666'
      },
      education: [{
        titleOfCertification: 'Bachelor of Science',
        typeOfCertification: 'Bachelors',
        fieldOfCertification: 'Computer Science',
        institution: 'State University',
        yearOfPassing: '2012',
        gpaOrGrade: '3.8'
      }],
      experience: [{
        companyName: 'Tech Solutions',
        designation: 'Jr. Developer',
        annualCTC: 50000,
        fromDate: '2012-06-01',
        toDate: '2014-05-31',
        reasonForLeaving: 'Better opportunity'
      }],
      references: [{ referenceName: 'Jane Smith', company: 'Tech Solutions', designation: 'Manager', contactNumber: '555-555-5555' }],
      identification: { 
        aadharNumber: '1234 5678 9012', 
        panNumber: 'ABCDE1234F',
        drivingLicenseNumber: 'DL123456789',
        licenseValidUpTo: '2030-10-20',
        passportNumber: 'Z1234567',
        passportValidUpTo: '2032-05-15',
        visaType: 'Employment Visa',
        visaNumber: '2543471888',
        visaValidUpTo: '2024-11-26',
        sponsor: 'Tarsheed Solutions Company'
      },
      compensation: { basicSalary: 60000, hra: 10000, otherAllowances: 5000, ctc: 80000, costPerHour: 40 },
      bankDetails: { bankName: 'First National Bank', branchName: 'Downtown', accountNumber: '1234567890', ifscCode: 'FNBK0001' }
    },
    { id: 'EMP002', name: 'Venkatesh S', email: 'venkatesh.s@example.com', employeeId: 'JS002', designation: 'Product Manager', department: 'Product', status: 'Active', avatar: 'https://picsum.photos/id/1011/200/200', firstName: 'Venkatesh', lastName: 'S', skills: [], personalDetails: { dateOfBirth: '1990-01-01', dobOriginal: '1990-01-01', maritalStatus: 'Married', permanentAddress: '', fatherOrSpouseName: '', bloodGroup: '', residentialAddress: '', emergencyContactNumber: '', relation: '', contactNumber: ''}, education: [], experience: [], references: [], identification: { aadharNumber: '', panNumber: '', drivingLicenseNumber: '', licenseValidUpTo: '', passportNumber: '', passportValidUpTo: '', visaType: '', visaNumber: '', visaValidUpTo: '', sponsor: '' }, compensation: { basicSalary: 0, hra: 0, otherAllowances: 0, ctc: 0, costPerHour: 0 }, bankDetails: {bankName: '', branchName: '', accountNumber: '', ifscCode: ''}, organization: '', orgDateOfJoining: '2019-01-01', ksaEmploymentJoining: '2021-01-01', category: 'C3', reportingTo: '', phoneNumber: '', nationality: 'Indian', employmentType: 'Full-time', gender: 'Male', personalEmail: '', countryCode: '+91', alternateContact: ''},
    { id: 'EMP003', name: 'Susan Wilson', email: 'susan.wilson@example.com', employeeId: 'SW003', designation: 'UX Designer', department: 'Design', status: 'Terminated', avatar: 'https://picsum.photos/id/1027/200/200', firstName: 'Susan', lastName: 'Wilson', skills: [], personalDetails: { dateOfBirth: '', dobOriginal: '', maritalStatus: 'Single', permanentAddress: '', fatherOrSpouseName: '', bloodGroup: '', residentialAddress: '', emergencyContactNumber: '', relation: '', contactNumber: ''}, education: [], experience: [], references: [], identification: { aadharNumber: '', panNumber: '', drivingLicenseNumber: '', licenseValidUpTo: '', passportNumber: '', passportValidUpTo: '', visaType: '', visaNumber: '', visaValidUpTo: '', sponsor: '' }, compensation: { basicSalary: 0, hra: 0, otherAllowances: 0, ctc: 0, costPerHour: 0 }, bankDetails: {bankName: '', branchName: '', accountNumber: '', ifscCode: ''}, organization: '', orgDateOfJoining: '', ksaEmploymentJoining: '', category: '', reportingTo: '', phoneNumber: '', nationality: '', employmentType: 'Full-time', gender: 'Female', personalEmail: '', countryCode: '+1', alternateContact: ''},
    { id: 'EMP004', name: 'Allyce Brown', email: 'allyce.brown@example.com', employeeId: 'AB004', designation: 'Data Scientist', department: 'Analytics', status: 'Resigned', avatar: 'https://picsum.photos/id/3/200/200', firstName: 'Allyce', lastName: 'Brown', skills: [], personalDetails: { dateOfBirth: '', dobOriginal: '', maritalStatus: 'Single', permanentAddress: '', fatherOrSpouseName: '', bloodGroup: '', residentialAddress: '', emergencyContactNumber: '', relation: '', contactNumber: ''}, education: [], experience: [], references: [], identification: { aadharNumber: '', panNumber: '', drivingLicenseNumber: '', licenseValidUpTo: '', passportNumber: '', passportValidUpTo: '', visaType: '', visaNumber: '', visaValidUpTo: '', sponsor: '' }, compensation: { basicSalary: 0, hra: 0, otherAllowances: 0, ctc: 0, costPerHour: 0 }, bankDetails: {bankName: '', branchName: '', accountNumber: '', ifscCode: ''}, organization: '', orgDateOfJoining: '', ksaEmploymentJoining: '', category: '', reportingTo: '', phoneNumber: '', nationality: '', employmentType: 'Full-time', gender: 'Female', personalEmail: '', countryCode: '+44', alternateContact: ''},
  ]);

  private _nextId = signal(5);
  public readonly employees = this._employees.asReadonly();

  addEmployee(employeeData: Partial<Employee>): void {
    const newId = `EMP${this._nextId().toString().padStart(3, '0')}`;
    this._nextId.update(id => id + 1);

    const newEmployee: Employee = {
      id: newId,
      name: `${employeeData.firstName} ${employeeData.lastName}`,
      email: employeeData.email || '',
      personalEmail: '',
      employeeId: employeeData.employeeId || '',
      designation: employeeData.designation || '',
      department: employeeData.department || '',
      status: (employeeData.status as any) || 'Active',
      avatar: `https://picsum.photos/seed/${newId}/200/200`,
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
      gender: 'Male', // default
      skills: [],
      personalDetails: {
          dateOfBirth: '',
          dobOriginal: '',
          maritalStatus: 'Single',
          fatherOrSpouseName: '',
          bloodGroup: '',
          residentialAddress: '',
          permanentAddress: '',
          emergencyContactNumber: '',
          relation: '',
          contactNumber: '',
      },
      education: [],
      experience: [],
      references: [],
      identification: {
          aadharNumber: '', panNumber: '', drivingLicenseNumber: '', licenseValidUpTo: '', passportNumber: '', passportValidUpTo: '', visaType: '', visaNumber: '', visaValidUpTo: '', sponsor: ''
      },
      compensation: { basicSalary: 0, hra: 0, otherAllowances: 0, ctc: 0, costPerHour: 0 },
      bankDetails: { bankName: '', branchName: '', accountNumber: '', ifscCode: '' }
    };

    this._employees.update(employees => [...employees, newEmployee]);
  }

  deleteEmployee(employeeId: string): void {
      this._employees.update(employees => employees.filter(e => e.id !== employeeId));
  }
  
  updateEmployee(updatedEmployee: Employee): void {
    this._employees.update(employees => 
      employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
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
