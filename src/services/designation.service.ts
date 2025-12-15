import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Designation {
    id: number;
    name: string;
    department: string;
}

const API_URL = '/api/designations';

@Injectable({
    providedIn: 'root'
})
export class DesignationService {
    private http = inject(HttpClient);
    private _designations = signal<Designation[]>([]);
    public readonly designations = this._designations.asReadonly();

    constructor() {
        this.loadDesignations();
    }

    async loadDesignations(): Promise<void> {
        try {
            const designations = await lastValueFrom(this.http.get<Designation[]>(API_URL));
            this._designations.set(designations);
        } catch (error) {
            console.error("Failed to load designations", error);
            this._designations.set([]);
        }
    }

    async addDesignation(designation: Omit<Designation, 'id'>): Promise<void> {
        await lastValueFrom(this.http.post<Designation>(API_URL, designation));
        await this.loadDesignations();
    }

    async updateDesignation(designation: Designation): Promise<void> {
        await lastValueFrom(this.http.put<Designation>(`${API_URL}/${designation.id}`, designation));
        await this.loadDesignations();
    }

    async deleteDesignation(id: number): Promise<void> {
        await lastValueFrom(this.http.delete(`${API_URL}/${id}`));
        await this.loadDesignations();
    }
}
