
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  onSubmit(): void {
    if (!this.email.trim() || !this.password) {
      alert('Please enter your email and password.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Login successful.');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        this.isLoading = false;
        alert(
          error?.error?.message || 'Login failed. Please check your credentials.',
        );
      },
    });
  }
}
