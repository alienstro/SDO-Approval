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

    this.loginService.login(loginData).subscribe(
      (response) => {
        // console.log("User Logged in: ", response);

        this.setTokenInCookie(response.token);
        this.navigateBasedOnRole(response.role);
        this.loginService.LoggedIn();
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

    if (role === '7' || role === '8') {
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
