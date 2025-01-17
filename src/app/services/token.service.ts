import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private cookieService: CookieService) { }

  isDecoded(): boolean {
    const token = this.getToken();
    const decodedToken = this.decodeToken();
    return token !== null && token !== '' && decodedToken !== null;
  }

  setToken(token: string): void {
    this.cookieService.set('token', token);
  }

  flushToken() {
    // // console.log("delete token");
    this.cookieService.delete('token', '/');
  }

  getToken() {
    const token = this.cookieService.get('token');
    if (token === null || token === undefined) {
      return null;
    } else {
      return token;
    }
  }

  clearToken(): void {
    const token = this.cookieService.get('token');
    localStorage.removeItem(token);
  }

  decodeToken() {
    const usertoken = this.getToken();
    if (usertoken) {
      const decodedToken = jwtDecode(usertoken);
      return decodedToken;
    }
    return null;
  }

  firstNameToken(decodedToken: any): string {
    if (decodedToken && decodedToken.data && decodedToken.data.first_name) {
      return decodedToken.data.first_name;
    } else {
      return '';
    }
  }

  lastNameToken(decodedToken: any): string {
    if (decodedToken && decodedToken.data && decodedToken.data.last_name) {
      return decodedToken.data.last_name;
    } else {
      return '';
    }
  }


  userIDToken(decodedToken: any): number {
    if (decodedToken && decodedToken.data && decodedToken.data.staff_id) {
      return decodedToken.data.staff_id;
    } else {
      return 0;
    }
  }

  userEmailToken(decodedToken: any): string {
    if (decodedToken && decodedToken.data && decodedToken.data.email) {
      return decodedToken.data.email;
    } else {
      return '';
    }
  }

  userRoleToken(decodedToken: any): string {
    const role = decodedToken?.data?.role;
    if (role) {
      return role;
    } else {
      console.warn("Role not found in decoded token data:", decodedToken);
      return '';
    }
  }
}
