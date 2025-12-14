import { Injectable, signal } from '@angular/core';

export interface MilestoneInvoice {
  sno: number;
  division: string;
  projectId: string;
  projectName: string;
  clientName: string;
  scope: string;
  poValue: number;
  poVat: number;
  yetToInvoiceValue: number;
  yetToInvoiceVat: number;
  outstandingValue: number;
  outstandingVat: number;
  invoiceValue: number;
  invoiceVat: number;
  collectedVat: number;
  collectedValue: number;
  invoiceStatus: 'YES' | 'NO';
  projectStatus: 'Commercially Open' | 'Project Closed';
  invoiceCount?: number;
  invoiceMonth?: string;
  // New fields for tracker
  projectType?: 'Project' | 'Deputation';
  dateOfPreparation?: string | null;
  preparedStatus?: 'Yes' | 'No';
  dateOfSubmission?: string | null;
  submittedStatus?: 'Yes' | 'No';
  receivingCopy?: 'Yes' | 'No' | '-';
  remarks?: string;
}

export type MonthlyInvoice = MilestoneInvoice;
export type ProRataInvoice = MilestoneInvoice;

export interface GeneratedInvoice {
  sno: number;
  invoiceId: string;
  poRef: string;
  invoiceLink: string;
  invoicePreparedDate: string;
  paymentPercent: number;
  invoicedValue: number;
  invoicedVatValue: number;
  lastUpdated: string;
}

export interface SubmittedInvoice {
  sno: number;
  invoiceId: string;
  poRef: string;
  invoicePreparedDate: string;
  invoiceSubmittedDate: string;
  invoiceValue: number;
  invoiceVatValue: number;
  paymentPercent: number;
  paymentMode: string;
  remarks: string;
}

export interface CompletedInvoice {
  sno: number;
  invoiceId: string;
  poRef: string;
  invoiceSubmittedDate: string;
  invoicedValue: number;
  invoicedVatValue: number;
  paymentPercent: number;
  paymentReceivedDate: string;
  receivedValue: number;
  receivedVatValue: number;
  paymentMode: string;
  bank: string;
  remarks: string;
}

export interface ProjectInvoiceDetails {
  projectId: string;
  projectName: string;
  projectType: 'Milestone' | 'Monthly' | 'Pro-rata';
  totalInvoicedValue: number;
  totalReceivedValue: number;
  totalOutstandingValue: number;
  totalInvoicedVatValue: number;
  totalReceivedVatValue: number;
  totalOutstandingVatValue: number;
  generatedInvoices: GeneratedInvoice[];
  submittedInvoices: SubmittedInvoice[];
  completedInvoices: CompletedInvoice[];
}


@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly _milestoneInvoices = signal<MilestoneInvoice[]>([
    {
      sno: 1,
      division: 'ENGINEERING',
      projectId: 'CONSA-ENG-DEP-0212',
      projectName: 'Call Center Create',
      clientName: 'Leo-Leon-company',
      scope: 'Design',
      poValue: 60000,
      poVat: 9000,
      invoiceValue: 50000,
      invoiceVat: 7500,
      collectedValue: 20000,
      collectedVat: 3000,
      yetToInvoiceValue: 10000,
      yetToInvoiceVat: 1500,
      outstandingValue: 30000,
      outstandingVat: 4500,
      invoiceStatus: 'YES',
      projectStatus: 'Commercially Open',
      invoiceCount: 2,
      invoiceMonth: 'Dec-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-12-15',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-12-20',
      submittedStatus: 'Yes',
      receivingCopy: 'Yes',
      remarks: '',
    },
    {
      sno: 2,
      division: 'BIM',
      projectId: 'P-1520',
      projectName: 'Architectural BIM',
      clientName: 'EG - Elenora',
      scope: 'LOD 300 Modeling',
      poValue: 250000,
      poVat: 37500,
      invoiceValue: 250000,
      invoiceVat: 37500,
      collectedValue: 250000,
      collectedVat: 37500,
      yetToInvoiceValue: 0,
      yetToInvoiceVat: 0,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'YES',
      projectStatus: 'Project Closed',
      invoiceCount: 5,
      invoiceMonth: 'Nov-2025',
      projectType: 'Deputation',
      dateOfPreparation: null,
      preparedStatus: 'No',
      dateOfSubmission: null,
      submittedStatus: 'No',
      receivingCopy: '-',
      remarks: '',
    },
    {
      sno: 3,
      division: 'LASER',
      projectId: 'P-1410',
      projectName: '3D Laser Scanning of Plant',
      clientName: 'PetroCorp',
      scope: 'On-site Laser Scan',
      poValue: 85000,
      poVat: 12750,
      invoiceValue: 85000,
      invoiceVat: 12750,
      collectedValue: 0,
      collectedVat: 0,
      yetToInvoiceValue: 0,
      yetToInvoiceVat: 0,
      outstandingValue: 85000,
      outstandingVat: 12750,
      invoiceStatus: 'YES',
      projectStatus: 'Commercially Open',
      invoiceCount: 1,
      invoiceMonth: 'Dec-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-12-01',
      preparedStatus: 'Yes',
      dateOfSubmission: null,
      submittedStatus: 'No',
      receivingCopy: '-',
      remarks: 'Awaiting client confirmation',
    },
    {
      sno: 4,
      division: 'BIM',
      projectId: 'P-1601',
      projectName: 'MEP Coordination for Tower',
      clientName: 'ConstructCo',
      scope: 'Clash Detection',
      poValue: 180000,
      poVat: 27000,
      invoiceValue: 9118251.06,
      invoiceVat: 1367737.66,
      collectedValue: 7145070.51,
      collectedVat: 1071760.58,
      yetToInvoiceValue: 0,
      yetToInvoiceVat: 0,
      outstandingValue: 1973180.55,
      outstandingVat: 295977.08,
      invoiceStatus: 'YES',
      projectStatus: 'Commercially Open',
      invoiceCount: 12,
      invoiceMonth: 'Dec-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-11-30',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-12-05',
      submittedStatus: 'Yes',
      receivingCopy: 'No',
      remarks: '',
    }
  ]);
  
  public readonly milestoneInvoices = this._milestoneInvoices.asReadonly();

  private readonly _monthlyInvoices = signal<MonthlyInvoice[]>([
    {
      sno: 1,
      division: 'BIM',
      projectId: 'M-BIM-001',
      projectName: 'Monthly BIM Support',
      clientName: 'Architex',
      scope: 'Ongoing Support',
      poValue: 120000,
      poVat: 18000,
      invoiceValue: 10000,
      invoiceVat: 1500,
      collectedValue: 10000,
      collectedVat: 1500,
      yetToInvoiceValue: 110000,
      yetToInvoiceVat: 16500,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'YES',
      projectStatus: 'Commercially Open',
      invoiceCount: 1,
      invoiceMonth: 'Nov-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-11-28',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-12-01',
      submittedStatus: 'Yes',
      receivingCopy: 'Yes',
      remarks: '',
    },
    {
      sno: 2,
      division: 'ENGINEERING',
      projectId: 'M-ENG-002',
      projectName: 'Retainer Engineering Services',
      clientName: 'ConstructCo',
      scope: 'Consulting',
      poValue: 240000,
      poVat: 36000,
      invoiceValue: 0,
      invoiceVat: 0,
      collectedValue: 0,
      collectedVat: 0,
      yetToInvoiceValue: 240000,
      yetToInvoiceVat: 36000,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'NO',
      projectStatus: 'Commercially Open',
      invoiceCount: 0,
      invoiceMonth: 'N/A',
    },
    {
      sno: 3,
      division: 'LASER',
      projectId: 'M-LSR-003',
      projectName: 'Monthly Laser Scan Maintenance',
      clientName: 'InfraBuild',
      scope: 'Calibration & Support',
      poValue: 50000,
      poVat: 7500,
      invoiceValue: 5000,
      invoiceVat: 750,
      collectedValue: 5000,
      collectedVat: 750,
      yetToInvoiceValue: 45000,
      yetToInvoiceVat: 6750,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'YES',
      projectStatus: 'Commercially Open',
      invoiceCount: 6,
      invoiceMonth: 'Dec-2025',
      projectType: 'Deputation',
      dateOfPreparation: '2025-12-22',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-12-23',
      submittedStatus: 'No',
      receivingCopy: '-',
      remarks: 'Pending submission',
    }
  ]);
  public readonly monthlyInvoices = this._monthlyInvoices.asReadonly();

  private readonly _proRataInvoices = signal<ProRataInvoice[]>([
    {
      sno: 1,
      division: 'LASER',
      projectId: 'PR-LSR-001',
      projectName: 'Partial Plant Scan',
      clientName: 'PetroCorp',
      scope: 'Phase 1 Scan',
      poValue: 50000,
      poVat: 7500,
      invoiceValue: 15000,
      invoiceVat: 2250,
      collectedValue: 15000,
      collectedVat: 2250,
      yetToInvoiceValue: 35000,
      yetToInvoiceVat: 5250,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'YES',
      projectStatus: 'Project Closed',
      invoiceCount: 1,
      invoiceMonth: 'Oct-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-10-10',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-10-12',
      submittedStatus: 'Yes',
      receivingCopy: 'Yes',
      remarks: 'Completed',
    },
    {
      sno: 2,
      division: 'BIM',
      projectId: 'PR-BIM-002',
      projectName: 'Initial BIM modeling',
      clientName: 'Architex',
      scope: 'Phase 1 Modeling',
      poValue: 75000,
      poVat: 11250,
      invoiceValue: 0,
      invoiceVat: 0,
      collectedValue: 0,
      collectedVat: 0,
      yetToInvoiceValue: 75000,
      yetToInvoiceVat: 11250,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'NO',
      projectStatus: 'Commercially Open',
      invoiceCount: 0,
      invoiceMonth: 'N/A',
    },
    {
      sno: 3,
      division: 'ENGINEERING',
      projectId: 'PR-ENG-003',
      projectName: 'Feasibility Study',
      clientName: 'ConstructCo',
      scope: 'Initial Report',
      poValue: 25000,
      poVat: 3750,
      invoiceValue: 25000,
      invoiceVat: 3750,
      collectedValue: 25000,
      collectedVat: 3750,
      yetToInvoiceValue: 0,
      yetToInvoiceVat: 0,
      outstandingValue: 0,
      outstandingVat: 0,
      invoiceStatus: 'YES',
      projectStatus: 'Project Closed',
      invoiceCount: 1,
      invoiceMonth: 'Sep-2025',
      projectType: 'Project',
      dateOfPreparation: '2025-09-15',
      preparedStatus: 'Yes',
      dateOfSubmission: '2025-09-18',
      submittedStatus: 'Yes',
      receivingCopy: 'Yes',
      remarks: '',
    }
  ]);
  public readonly proRataInvoices = this._proRataInvoices.asReadonly();

  private readonly _projectInvoiceDetails = signal<ProjectInvoiceDetails[]>([
    {
      projectId: 'CONSA-ENG-DEP-0212',
      projectName: 'Call Center Create',
      projectType: 'Milestone',
      totalInvoicedValue: 0,
      totalReceivedValue: 0,
      totalOutstandingValue: 0,
      totalInvoicedVatValue: 0,
      totalReceivedVatValue: 0,
      totalOutstandingVatValue: 0,
      generatedInvoices: [],
      submittedInvoices: [],
      completedInvoices: []
    },
    {
      projectId: 'P-1520',
      projectName: 'Architectural BIM',
      projectType: 'Milestone',
      totalInvoicedValue: 250000,
      totalReceivedValue: 250000,
      totalOutstandingValue: 0,
      totalInvoicedVatValue: 37500,
      totalReceivedVatValue: 37500,
      totalOutstandingVatValue: 0,
      generatedInvoices: [],
      submittedInvoices: [],
      completedInvoices: []
    }
  ]);

  public readonly projectInvoiceDetails = this._projectInvoiceDetails.asReadonly();

  public getProjectInvoiceDetailsById(id: string): ProjectInvoiceDetails | undefined {
    return this.projectInvoiceDetails().find(p => p.projectId === id);
  }

  public updateInvoiceTracking(projectId: string, sno: number, updates: Partial<MilestoneInvoice>): void {
    const updater = (invoice: MilestoneInvoice) => 
        (invoice.projectId === projectId && invoice.sno === sno) ? { ...invoice, ...updates } : invoice;

    this._milestoneInvoices.update(invoices => invoices.map(updater));
    this._monthlyInvoices.update(invoices => invoices.map(updater));
    this._proRataInvoices.update(invoices => invoices.map(updater));
  }
}
