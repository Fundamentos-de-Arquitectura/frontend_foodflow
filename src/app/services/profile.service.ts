import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  streetAddress: string;
  restaurantName: string;
  restaurantDescription: string;
  restaurantPhone: string;
  accountId: number;
}

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  number: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  restaurantName: string;
  restaurantDescription: string;
  restaurantPhone: string;
  accountId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = '/api/v1/profiles'; // Proxy handles routing

  constructor(private http: HttpClient) { }

  getProfileByAccountId(accountId: number): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.apiUrl}/account/${accountId}`);
  }

  createProfile(profile: CreateProfileRequest): Observable<ProfileData> {
    return this.http.post<ProfileData>(this.apiUrl, profile);
  }
}

