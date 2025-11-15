import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  user = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    subscription: 'Basic',
    joinedAt: new Date('2024-09-15')
  };

  profileForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
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

      // Simulate API call
      console.log('Updating profile:', formValue);

      // Update user data
      this.user.name = formValue.name;
      this.user.email = formValue.email;

      // Simulate successful update
      alert('Profile updated successfully!');
      this.isEditing = false;
    } else {
      alert('Please check your input and try again.');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.initializeForm();
  }
}
