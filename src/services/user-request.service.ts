
import { Injectable, signal } from '@angular/core';
import { Employee } from './employee.service';

export interface UserRequest {
  id: string; // Using employeeId as the unique ID for the request
  employee: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: 'Pending';
  dateSent: Date;
  expiryDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserRequestService {
  private readonly _requests = signal<UserRequest[]>([]);
  public readonly requests = this._requests.asReadonly();

  sendInvitation(employee: Employee): void {
    // Prevent duplicate requests
    if (this._requests().some(req => req.id === employee.id)) {
      console.warn(`Invitation for ${employee.name} already pending.`);
      return;
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + 7); // Set expiry to 7 days from now

    const newRequest: UserRequest = {
      id: employee.id,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        avatar: employee.avatar,
      },
      status: 'Pending',
      dateSent: now,
      expiryDate: expiry,
    };

    this._requests.update(reqs => [...reqs, newRequest]);
  }

  processRequest(requestId: string): void {
    this._requests.update(reqs => reqs.filter(req => req.id !== requestId));
  }
}
