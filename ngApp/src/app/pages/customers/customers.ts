
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';
import {
  Customer,
  CustomersService,
} from '../../core/customers-service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isLoading = false;
  isLoadingDetails = false;
  isLoggingOut = false;
  newCustomer = {
    name: '',
    email: '',
    phone: '',
    company: '',
  };

  isCreating = false;

  constructor(
    private readonly customersService: CustomersService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;

    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        console.log("🚀 ~ Customers ~ loadCustomers ~ customers:", customers)
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.handleUnauthorized();
          return;
        }

        alert(
          error?.error?.message || 'Unable to load customers.',
        );
      },
    });
  }

  openCustomer(customer: Customer): void {
    this.selectedCustomer = null;
    this.isLoadingDetails = true;

    this.customersService.getCustomer(customer.id).subscribe({
      next: (details) => {
        this.selectedCustomer = details;
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingDetails = false;

        if (error.status === 401) {
          this.handleUnauthorized();
          return;
        }

        alert(
          error?.error?.message || 'Unable to load customer details.',
        );
      },
    });
  }

  closeDetails(): void {
    this.selectedCustomer = null;
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => {
        this.finishLogout();
        alert('You have been logged out.');
      },
      error: (error) => {
        this.isLoggingOut = false;

        if (error.status === 401) {
          // The server already considers this session invalid.
          this.finishLogout();
          alert('Your session has expired. Please sign in again.');
          return;
        }

        alert(
          error?.error?.message ||
          'Logout failed. Please check your connection and try again.',
        );
      },
    });
  }

  private handleUnauthorized(): void {
    this.authService.clearSession();
    this.clearCustomerData();
    void this.router.navigate(['/login'], { replaceUrl: true });
    alert('Your session is invalid or has expired. Please sign in again.');
  }

  private finishLogout(): void {
    this.authService.clearSession();
    this.clearCustomerData();
    this.isLoggingOut = false;
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  private clearCustomerData(): void {
    this.customers = [];
    this.selectedCustomer = null;
  }


  createCustomer(): void {
    if (this.isCreating) return;

    const data = {
      name: this.newCustomer.name.trim(),
      email: this.newCustomer.email.trim(),
      phone: this.newCustomer.phone.trim() || undefined,
      company: this.newCustomer.company.trim() || undefined,
    };

    if (!data.name || !data.email) {
      alert('Name and email are required.');
      return;
    }

    this.isCreating = true;

    this.customersService.createCustomer(data).subscribe({
      next: customer => {
        this.isCreating = false;
        this.newCustomer = {
          name: '',
          email: '',
          phone: '',
          company: '',
        };

        this.loadCustomers();
        alert(`Customer "${customer.name}" created successfully.`);
        this.cdr.markForCheck();
      },
      error: error => {
        this.isCreating = false;
        alert(
          error?.error?.message || 'Unable to create customer.',
        );
      },
    });
  }
}
