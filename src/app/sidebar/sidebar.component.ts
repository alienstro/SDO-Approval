import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false
})
export class SidebarComponent{
  firstName!: string;
  lastName!: string;
  department_id!: string;

  constructor(private router: Router, private loginService: LoginService, private tokenService: TokenService) {
    this.firstName = this.tokenService.firstNameToken(this.tokenService.decodeToken());
    this.lastName = this.tokenService.lastNameToken(this.tokenService.decodeToken());
    this.department_id = this.tokenService.userRoleToken(this.tokenService.decodeToken());

    console.log("department: ",this.department_id);
  }

  logout(): void {
    this.router.navigate(['/login']);
    this.loginService.userLoggedOut();
  }

  applications(): void {
    this.router.navigate(['/forward-view'])
  }


}
