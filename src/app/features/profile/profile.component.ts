import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    MatInputModule,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isEditing = false;
  profile: ProfileData | null = null;
  isLoading = true;

  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private profileService: ProfileService,
    private translate: TranslateService
  ) {}

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
        alert(this.translate.instant('PASSWORDS_NOT_MATCH'));
        return;
      }

      // Validate current password if changing password
      if (formValue.newPassword && !formValue.currentPassword) {
        alert(this.translate.instant('ENTER_CURRENT_PASSWORD'));
        return;
      }

      // TODO: Implement actual profile update API call
      console.log('Updating profile:', formValue);

      // Simulate successful update
      alert(this.translate.instant('PROFILE_UPDATED_SUCCESS'));
      this.isEditing = false;
      this.loadProfile(); // Reload profile data
    } else {
      alert(this.translate.instant('CHECK_INPUT'));
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.initializeForm();
  }
}
