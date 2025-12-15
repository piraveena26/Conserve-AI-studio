import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface JobRole {
    id: number;
    name: string;
    designation_id?: number;
    position: string; // This corresponds to the designation name from the backend join
}

const API_URL = '/api/job-roles';

@Injectable({
    providedIn: 'root'
})
export class JobRoleService {
    private http = inject(HttpClient);
    private _jobRoles = signal<JobRole[]>([]);
    public readonly jobRoles = this._jobRoles.asReadonly();

    constructor() {
        this.loadJobRoles();
    }

    async loadJobRoles(): Promise<void> {
        try {
            const jobRoles = await lastValueFrom(this.http.get<JobRole[]>(API_URL));
            this._jobRoles.set(jobRoles);
        } catch (error) {
            console.error("Failed to load job roles", error);
            this._jobRoles.set([]);
        }
    }

    async addJobRole(jobRole: { name: string, designation_id: number }): Promise<void> {
        await lastValueFrom(this.http.post<JobRole>(API_URL, jobRole));
        await this.loadJobRoles();
    }

    async updateJobRole(jobRole: { id: number, name: string, designation_id: number }): Promise<void> {
        await lastValueFrom(this.http.put<JobRole>(`${API_URL}/${jobRole.id}`, jobRole));
        await this.loadJobRoles();
    }

    async deleteJobRole(id: number): Promise<void> {
        await lastValueFrom(this.http.delete(`${API_URL}/${id}`));
        await this.loadJobRoles();
    }
}
