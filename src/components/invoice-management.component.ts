import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-management',
  template: `<!-- This component is no longer used directly for view routing. Sub-components are now routed from the main app component. -->`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class InvoiceManagementComponent {}
