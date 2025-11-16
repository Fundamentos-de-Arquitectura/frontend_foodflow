import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProfileService, ProfileData } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isEditing = false;
  profile: ProfileData | null = null;
  isLoading = true;

  profileForm!: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
    this.initializeForm();
  }

  loadProfile(): void {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      console.error('User ID not found');
      this.isLoading = false;
      return;
    }
    
    const userId = parseInt(userIdStr, 10);
    
    this.profileService.getProfileByAccountId(userId).subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
        this.initializeForm();
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoading = false;
      }
    });
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: [this.profile?.fullName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.profile?.email || '', [Validators.required, Validators.email]],
      restaurantName: [this.profile?.restaurantName || '', [Validators.required]],
      restaurantDescription: [this.profile?.restaurantDescription || ''],
      restaurantPhone: [this.profile?.restaurantPhone || ''],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initializeForm(); // Reset form when canceling
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;

      // Validate password matching if changing password
      if (formValue.newPassword && formValue.newPassword !== formValue.confirmPassword) {
        alert('New passwords do not match');
        return;
      }

      // Validate current password if changing password
      if (formValue.newPassword && !formValue.currentPassword) {
        alert('Please enter your current password to change it');
        return;
      }

      // TODO: Implement actual profile update API call
      console.log('Updating profile:', formValue);

      // Simulate successful update
      alert('Profile updated successfully!');
      this.isEditing = false;
      this.loadProfile(); // Reload profile data
    } else {
      alert('Please check your input and try again.');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.initializeForm();
  }
}
