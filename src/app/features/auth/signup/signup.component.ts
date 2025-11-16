import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, CreateProfileRequest } from '../../../services/profile.service';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      // Personal information
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Address
      street: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      // Restaurant information
      restaurantName: ['', Validators.required],
      restaurantDescription: [''],
      restaurantPhone: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      
      if (formValue.password !== formValue.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      // Step 1: Create account in IAM service
      const signupData = {
        username: formValue.username,
        password: formValue.password,
        role: 'ADMIN' // Backend only accepts ADMIN role
      };

      this.authService.signup(signupData).pipe(
        switchMap((authResponse) => {
          console.log('User registered successfully:', authResponse);
          
          // Step 2: Create profile with restaurant information
          const profileData: CreateProfileRequest = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            street: formValue.street,
            number: formValue.number,
            city: formValue.city,
            state: formValue.state,
            postalCode: formValue.postalCode,
            country: formValue.country,
            restaurantName: formValue.restaurantName,
            restaurantDescription: formValue.restaurantDescription || '',
            restaurantPhone: formValue.restaurantPhone || '',
            accountId: authResponse.id // Use the account ID returned from IAM
          };
          
          return this.profileService.createProfile(profileData);
        })
      ).subscribe({
        next: (profileResponse) => {
          console.log('Profile created successfully:', profileResponse);
          this.isLoading = false;
          // After successful signup and profile creation, redirect to login
          alert('Account and restaurant profile created successfully! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Signup or profile creation error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
