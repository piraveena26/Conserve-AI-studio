import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LeaveRequest {
    id: number;
    employeeId: string;
    employeeName: string;
    employeeAvatar: string;
    leaveType: string;
    leaveRange: 'One Day' | 'More Than a Day';
    date?: string;
    fromDate?: string;
    toDate?: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    appliedOn: Date;
}

// Backend response format uses snake_case
interface LeaveRequestBackend {
    id: number;
    employee_id: string;
    employee_name: string;
    employee_avatar: string;
    leave_type: string;
    leave_range: 'One Day' | 'More Than a Day';
    date?: string;
    from_date?: string;
    to_date?: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    applied_on: string;
}

@Injectable({
    providedIn: 'root',
})
export class LeaveService {
    private http = inject(HttpClient);
    private apiUrl = '/api/leave-requests';

    private readonly _leaveRequests = signal<LeaveRequest[]>([]);
    public readonly leaveRequests = this._leaveRequests.asReadonly();

    constructor() {
        this.loadLeaveRequests();
    }

    private mapBackendToFrontend(backend: LeaveRequestBackend): LeaveRequest {
        return {
            id: backend.id,
            employeeId: backend.employee_id,
            employeeName: backend.employee_name,
            employeeAvatar: backend.employee_avatar,
            leaveType: backend.leave_type,
            leaveRange: backend.leave_range,
            date: backend.date,
            fromDate: backend.from_date,
            toDate: backend.to_date,
            reason: backend.reason,
            status: backend.status,
            appliedOn: new Date(backend.applied_on),
        };
    }

    private mapFrontendToBackend(leave: Partial<LeaveRequest>): any {
        return {
            employee_id: leave.employeeId,
            employee_name: leave.employeeName,
            employee_avatar: leave.employeeAvatar,
            leave_type: leave.leaveType,
            leave_range: leave.leaveRange,
            date: leave.date,
            from_date: leave.fromDate,
            to_date: leave.toDate,
            reason: leave.reason,
            status: leave.status,
        };
    }

    loadLeaveRequests(): void {
        this.http.get<LeaveRequestBackend[]>(this.apiUrl).subscribe({
            next: (requests) => {
                const mapped = requests.map(r => this.mapBackendToFrontend(r));
                this._leaveRequests.set(mapped);
            },
            error: (err) => console.error('Error loading leave requests:', err),
        });
    }

    createLeaveRequest(leaveData: Partial<LeaveRequest>): void {
        const backendData = this.mapFrontendToBackend(leaveData);

        this.http.post<LeaveRequestBackend>(this.apiUrl, backendData).subscribe({
            next: (created) => {
                const mapped = this.mapBackendToFrontend(created);
                this._leaveRequests.update(requests => [...requests, mapped]);
            },
            error: (err) => console.error('Error creating leave request:', err),
        });
    }

    updateLeaveRequest(id: number, leaveData: Partial<LeaveRequest>): void {
        const backendData = this.mapFrontendToBackend(leaveData);

        this.http.put<LeaveRequestBackend>(`${this.apiUrl}/${id}`, backendData).subscribe({
            next: (updated) => {
                const mapped = this.mapBackendToFrontend(updated);
                this._leaveRequests.update(requests =>
                    requests.map(r => (r.id === id ? mapped : r))
                );
            },
            error: (err) => console.error('Error updating leave request:', err),
        });
    }

    updateLeaveStatus(id: number, status: 'Approved' | 'Rejected'): void {
        this.http.patch<LeaveRequestBackend>(`${this.apiUrl}/${id}/status`, { status }).subscribe({
            next: (updated) => {
                const mapped = this.mapBackendToFrontend(updated);
                this._leaveRequests.update(requests =>
                    requests.map(r => (r.id === id ? mapped : r))
                );
            },
            error: (err) => console.error('Error updating leave status:', err),
        });
    }

    deleteLeaveRequest(id: number): void {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._leaveRequests.update(requests => requests.filter(r => r.id !== id));
            },
            error: (err) => console.error('Error deleting leave request:', err),
        });
    }

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
