import { Injectable, signal, computed } from '@angular/core';

// --- Interfaces ---
export interface Enquiry {
  id: number;
  sno: number;
  enquiryDate: string;
  division: string;
  rfqId: string;
  projectName: string;
  clientName: string;
  enquiryStatus: 'Submitted' | 'Not Submitted' | 'Dropped';
  submissionDeadline: string;

  // New fields for proposal
  projectType: string;
  scope: string;
  responsibilities: string;
  stage: string;
  revision: number;
  quotations: string[];
  proposalValue?: number;
  vatValue?: number;
  vatStatus?: 'Inclusive' | 'Exclusive';
  // added optional fields
  projectAbbr?: string;
  clientAbbr?: string;
  clientContacts?: {
    contactPerson: string;
    designation: string;
    phone: string;
    email: string;
  }[];
  projectLocation: string;
  notes?: string;
  // New fields for this request
  projectStatus?: 'Pending' | 'Awarded' | 'Lost';
  budgetValue?: number;
}

export interface Scope {
  id: number;
  division: string;
  subDivision: string;
  name: string;
}

export interface Client {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class EnquiryService {
  // --- Private Signals ---
  private _enquiries = signal<Enquiry[]>([
    { id: 1, sno: 1, enquiryDate: '2025-10-12', division: 'LASER', rfqId: 'CON/SA/CO-ETS-EQ-10-2025', projectName: 'ETS - Laser Scanning', clientName: 'EG - Elenora', enquiryStatus: 'Submitted', submissionDeadline: '2025-10-18', projectType: 'Project', scope: '3D Point Cloud Processing', responsibilities: 'Data Acquisition Team', stage: 'Tender', revision: 1, quotations: ['/quotes/QT-2025-10-01.pdf'], proposalValue: 120000, vatValue: 18000, vatStatus: 'Exclusive', projectLocation: 'Main Office', notes: 'Initial quote sent.', projectStatus: 'Pending', budgetValue: 110000 },
    { id: 2, sno: 2, enquiryDate: '2025-10-11', division: 'BIM', rfqId: 'BIM/SA/CO-ETS-EQ-10-2025', projectName: 'BIM Modeling Services', clientName: 'Architex', enquiryStatus: 'Not Submitted', submissionDeadline: '2025-10-20', projectType: 'Project', scope: 'LOD 300 Modeling', responsibilities: 'BIM Modellers', stage: 'Tender', revision: 0, quotations: [], proposalValue: 85000, vatValue: 12750, vatStatus: 'Exclusive', projectLocation: 'Riyadh Branch', notes: 'Awaiting client feedback.', projectStatus: 'Pending', budgetValue: 80000 },
    { id: 3, sno: 3, enquiryDate: '2025-10-09', division: 'LASER', rfqId: 'LAS/SA/CO-SCAN-10-2025', projectName: '3D Laser Scanning of Plant', clientName: 'PetroCorp', enquiryStatus: 'Dropped', submissionDeadline: '2025-10-15', projectType: 'Deputation', scope: 'On-site Laser Scan', responsibilities: 'Field Team', stage: 'Dropped', revision: 0, quotations: [], proposalValue: 50000, vatValue: 7500, vatStatus: 'Inclusive', projectLocation: 'Jeddah Site', notes: 'Client went with a competitor.', projectStatus: 'Lost', budgetValue: 60000 },
    { id: 4, sno: 4, enquiryDate: '2025-10-15', division: 'BIM', rfqId: 'BIM/SA/CO-ARCH-10-2025', projectName: 'Architectural BIM', clientName: 'EG - Elenora', enquiryStatus: 'Submitted', submissionDeadline: '2025-10-22', projectType: 'Project', scope: 'LOD 300 Modeling', responsibilities: 'BIM Modellers', stage: 'Job in Hand', revision: 2, quotations: ['/quotes/QT-2025-10-05_rev1.pdf', '/quotes/QT-2025-10-05_rev2.pdf'], proposalValue: 250000, vatValue: 37500, vatStatus: 'Exclusive', projectLocation: 'Main Office', projectStatus: 'Awarded', budgetValue: 240000 },
    { id: 5, sno: 5, enquiryDate: '2025-11-06', division: 'SIMULATION & ANALYSIS', rfqId: 'SIM/SA/GC-EQ-11-2025', projectName: 'Solar Panel Support Clamps', clientName: 'GC - Gate Corporation', enquiryStatus: 'Submitted', submissionDeadline: '2025-11-10', projectType: 'Project', scope: 'Structural Support Design Validation and Analysis', responsibilities: 'Karthikeyan Elumalai', stage: 'Job in Hand', revision: 0, quotations: [], proposalValue: 7500, vatValue: 1125, vatStatus: 'Exclusive', clientAbbr: 'GC', projectLocation: 'Dammam Facility', notes: 'PO received.', projectStatus: 'Awarded', budgetValue: 7000 },
  ]);
  private _nextEnquiryId = signal(6);

  private _scopes = signal<Scope[]>([
    { id: 1, division: 'LASER', subDivision: 'Project', name: '3D Point Cloud Processing' },
    { id: 2, division: 'LASER', subDivision: 'Project', name: 'As-Built Documentation' },
    { id: 3, division: 'BIM', subDivision: 'Project', name: 'LOD 300 Modeling' },
    { id: 4, division: 'BIM', subDivision: 'Deputation', name: 'On-site BIM Coordinator' },
    { id: 5, division: 'SIMULATION & ANALYSIS', subDivision: 'Project', name: 'Structural Support Design Validation and Analysis' }
  ]);
  private _nextScopeId = signal(6);

  private _clients = signal<Client[]>([]);
  private _nextClientId = signal(1);

  // --- Public Readonly Signals ---
  public readonly enquiries = this._enquiries.asReadonly();
  public readonly scopes = this._scopes.asReadonly();
  public readonly clients = this._clients.asReadonly();

  // --- Computed Signals for specific views ---
  public readonly followUpEnquiries = computed(() => this._enquiries().filter(e => e.enquiryStatus === 'Not Submitted'));
  public readonly proposalEnquiries = computed(() => this._enquiries().filter(e => e.enquiryStatus === 'Submitted'));
  
  constructor() {
    this.initializeClientsFromEnquiries();
  }

  private initializeClientsFromEnquiries(): void {
    const clientNames = [...new Set(this._enquiries().map(e => e.clientName))];
    // FIX: Explicitly cast `name` to a string. This resolves a type inference
    // issue where `name` was being inferred as `unknown`, causing a type mismatch
    // with the `Client` interface.
    const clientObjects: Client[] = clientNames.map((name, index) => ({ id: index + 1, name: String(name) }));
    this._clients.set(clientObjects);
    this._nextClientId.set(clientNames.length + 1);
  }
  
  // --- Methods ---
  addEnquiry(enquiryData: Omit<Enquiry, 'id' | 'sno' | 'rfqId' | 'revision' | 'quotations'>): void {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: this._nextEnquiryId(),
      sno: this._nextEnquiryId(),
      rfqId: `RFQ-${Date.now()}`, // Generate a temporary RFQ ID
      // Default proposal fields for new enquiries
      revision: 0,
      quotations: [],
      // FIX: Add default projectStatus
      projectStatus: 'Pending',
    };
    this._enquiries.update(enquiries => [...enquiries, newEnquiry]);
    this._nextEnquiryId.update(id => id + 1);
  }

  updateEnquiry(updatedEnquiry: Enquiry): void {
    this._enquiries.update(enquiries =>
      enquiries.map(e => e.id === updatedEnquiry.id ? updatedEnquiry : e)
    );
  }

  deleteEnquiry(enquiryId: number): void {
    this._enquiries.update(enquiries => enquiries.filter(e => e.id !== enquiryId));
  }

  addScope(scopeData: Omit<Scope, 'id'>): void {
    const newScope: Scope = {
      ...scopeData,
      id: this._nextScopeId(),
    };
    this._scopes.update(scopes => [...scopes, newScope]);
    this._nextScopeId.update(id => id + 1);
  }
  
  addClient(clientName: string): void {
    if (clientName && !this._clients().some(c => c.name.toLowerCase() === clientName.toLowerCase())) {
      const newClient: Client = { id: this._nextClientId(), name: clientName };
      this._clients.update(clients => [...clients, newClient]);
      this._nextClientId.update(id => id + 1);
    }
  }

  updateClient(updatedClient: Client): void {
    this._clients.update(clients => 
      clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    );
  }

  deleteClient(clientId: number): void {
    this._clients.update(clients => clients.filter(c => c.id !== clientId));
  }
}