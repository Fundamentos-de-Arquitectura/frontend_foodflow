import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// AuthService import removed - using mock authentication for demo

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = this.form.getRawValue();

      // Simulate successful login (in real app, this would call authService.login)
      // For demo purposes, accept any email/password combination
      this.simulateLogin(credentials);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  private simulateLogin(credentials: { email: string; password: string }): void {
    // Simulate API delay
    setTimeout(() => {
      // Accept any login for demo
      if (credentials.email && credentials.password) {
        // Store a mock token
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
          name: 'John Doe',
          email: credentials.email
        }));

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    }, 1000);
  }
}
