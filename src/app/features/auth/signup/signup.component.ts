import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { username, password, confirmPassword } = this.form.getRawValue();
      
      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      // Backend expects: username, password, role (must be "ADMIN")
      const signupData = {
        username,
        password,
        role: 'ADMIN' // Backend only accepts ADMIN role
      };

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          console.log('User registered successfully:', response);
          this.isLoading = false;
          // After successful signup, redirect to login
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Signup error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
