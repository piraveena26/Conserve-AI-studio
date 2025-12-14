import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Department {
  id: number;
  name: string;
}

const API_URL = '/api/departments';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private _departments = signal<Department[]>([]);
  public readonly departments = this._departments.asReadonly();

  constructor() {
    this.loadDepartments();
  }

  async loadDepartments(): Promise<void> {
    try {
      const departments = await lastValueFrom(this.http.get<Department[]>(API_URL));
      this._departments.set(departments);
    } catch (error) {
      console.error("Failed to load departments", error);
      this._departments.set([]);
    }
  }

  async addDepartment(department: Omit<Department, 'id'>): Promise<void> {
    await lastValueFrom(this.http.post<Department>(API_URL, department));
    await this.loadDepartments();
  }

  async updateDepartment(department: Department): Promise<void> {
    await lastValueFrom(this.http.put<Department>(`${API_URL}/${department.id}`, department));
    await this.loadDepartments();
  }

  async deleteDepartment(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`${API_URL}/${id}`));
    await this.loadDepartments();
  }
}
