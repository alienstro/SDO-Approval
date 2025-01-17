import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Add HttpClient and HttpHeaders
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenService } from './token.service';
import { API_URL } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = `${API_URL}/login`;

  private _loadValues = new BehaviorSubject<number | null>(null);
  loadValues$ = this._loadValues.asObservable();
  private _adminLoadValues = new BehaviorSubject<number | null>(null);
  adminLoadValues$ = this._adminLoadValues.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    const token = this.tokenService.getToken();
    if (token) {
      this.LoggedIn();
    }
  }

  login(postData: any): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }

  public LoggedIn(): void {
    const userID = this.tokenService.userIDToken(this.tokenService.decodeToken());
    const userRole = this.tokenService.userRoleToken(this.tokenService.decodeToken());
    console.log("userID: ", userID)
    if (userRole === 'Admin') {
      this._adminLoadValues.next(userID);
    } else {
      this._loadValues.next(userID);
    }
  }

  public userLoggedOut(): void {
    this._loadValues.next(null);
    this._adminLoadValues.next(null);
    this.tokenService.clearToken();
  }
}
