import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TimesheetProject {
    id: number;
    name: string;
    client: string;
    startDate: string;
    endDate: string;
    estimatedTime: string;
    status: 'Commercially Open' | 'On Hold';
    description: string;
    assignedTo: string[];
}

@Injectable({
    providedIn: 'root',
})
export class TimesheetProjectService {
    private http = inject(HttpClient);
    private apiUrl = '/api/timesheet-projects';

    private readonly _projects = signal<TimesheetProject[]>([]);
    public readonly projects = this._projects.asReadonly();

    constructor() {
        this.loadProjects();
    }

    loadProjects() {
        this.http.get<TimesheetProject[]>(this.apiUrl).subscribe({
            next: (projects) => this._projects.set(projects),
            error: (err) => console.error('Error loading timesheet projects:', err)
        });
    }

    addProject(projectData: Omit<TimesheetProject, 'id'>): void {
        this.http.post<TimesheetProject>(this.apiUrl, projectData).subscribe({
            next: (createdProject) => {
                this._projects.update(projects => [createdProject, ...projects]);
            },
            error: (err) => console.error('Error adding timesheet project:', err)
        });
    }

    updateProject(updatedProject: TimesheetProject): void {
        this.http.put<TimesheetProject>(`${this.apiUrl}/${updatedProject.id}`, updatedProject).subscribe({
            next: (savedProject) => {
                this._projects.update(projects =>
                    projects.map(p => p.id === savedProject.id ? savedProject : p)
                );
            },
            error: (err) => console.error('Error updating timesheet project:', err)
        });
    }

    deleteProject(projectId: number): void {
        this.http.delete(`${this.apiUrl}/${projectId}`).subscribe({
            next: () => {
                this._projects.update(projects => projects.filter(p => p.id !== projectId));
            },
            error: (err) => console.error('Error deleting timesheet project:', err)
        });
    }
}
