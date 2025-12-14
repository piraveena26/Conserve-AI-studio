
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
