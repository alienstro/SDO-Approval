import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { TokenService } from '../services/token.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false,
})
export class SidebarComponent {
  firstName!: string;
  lastName!: string;
  department_id!: any;
  staff_id!: number;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private tokenService: TokenService,
    public dialog: MatDialog
  ) {
    this.firstName = this.tokenService.firstNameToken(
      this.tokenService.decodeToken()
    );
    this.lastName = this.tokenService.lastNameToken(
      this.tokenService.decodeToken()
    );
    this.department_id = this.tokenService.userRoleToken(
      this.tokenService.decodeToken()
    );

    this.staff_id = this.tokenService.userIDToken(
      this.tokenService.decodeToken()
    );

    console.log('department: ', this.department_id);
  }

  logout(): void {
    this.router.navigate(['/login']);
    this.loginService.userLoggedOut();
  }

  changePassword(): void {
    this.dialog.open(ChangePasswordComponent, {
      data: { staff_id: this.staff_id },
    });
  }

  applications(): void {
    this.router.navigate(['/forward-view']);
  }
}
