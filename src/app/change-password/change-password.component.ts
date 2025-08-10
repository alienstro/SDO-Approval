import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RequestService } from '../services/request.service';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private requestService: RequestService
  ) {
    this.passwordForm = this.fb.group(
      {
        current_password: ['', Validators.required],
        new_password: ['', Validators.required],
        re_type_password: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const retypePassword = form.get('re_type_password')?.value;
    return newPassword === retypePassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const data = {
        details: this.passwordForm.value,
        staff_id: this.data.staff_id,
      };

      console.log('Password', this.passwordForm.value);

      this.requestService.editPasswordStaff(data).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('Changed password successfully!', 'Close', {
              duration: 3000,
              panelClass: 'snackbar-success',
            });
            this.passwordForm.reset();
            this.dialogRef.close();
          } else {
            this.snackBar.open('Failed to change. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        },
        error: (err) => {
          if (err.status === 409) {
            this.snackBar.open(
              'The current password you entered is incorrect.',
              'Close',
              {
                duration: 3000,
                panelClass: 'snackbar-error',
              }
            );
          } else {
            this.snackBar.open('Failed to add. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
