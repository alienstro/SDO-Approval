import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../services/login.service';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private authService: AuthService,
    private snackBar: MatSnackBar

  ) {

  }

  onLogin() {
    const loginData = this.loginForm.value;

    if (loginData.email === '' || loginData.password === '') {
      this.snackBar.open("Email and Password are required. Please Try Again.", 'Close', { duration: 3000 });
      return;
    }

    this.loginService.login(loginData).subscribe(
      (response) => {
        if (response.message !== "Invalid email or password") {
          // console.log("User Logged in: ", response);

          this.setTokenInCookie(response.token);
          this.navigateBasedOnRole(response.role);
          this.loginService.LoggedIn();
          this.snackBar.open("Successfully Logged In", 'Close', { duration: 3000 });
        } else {
          this.snackBar.open("Email or password is incorrect. Please try again.", 'Close', { duration: 3000 });
        }
      },
      (error) => {
        this.snackBar.open("Email or password is incorrect. Please try again.");
        console.error('Error creating user: ', error);
      }
    );
  }

  navigateBasedOnRole(role: string) {
    role = this.authService.getRole();

    console.log(role)

    const roleId = parseInt(role);

    if (roleId === 6 || roleId === 7) {
      this.router.navigate(['/forward-view']);
    } else {
      this.router.navigate(['/login']);
      console.log("No authority")
      this.snackBar.open('You are not allowed here!', '', {
        duration: 3000
      })
    }
  }

  setTokenInCookie(token: string) {
    document.cookie = "token=" + token;
  }


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

}
