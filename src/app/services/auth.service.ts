import { Injectable } from '@angular/core';
import { TokenService } from '../services/token.service';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    
    [x: string]: any;
    constructor(private tokenService: TokenService) { }

    setToken(token: string): void {
        this.tokenService.setToken(token);
    }

    isAuthenticated(): boolean {
        return !!this.tokenService.getToken();
    }

    getRole(): string {
        return this.tokenService.userRoleToken(this.tokenService.decodeToken());
    }
}
