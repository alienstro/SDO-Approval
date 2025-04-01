import { Component, Inject, InjectionToken } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TokenService } from '../services/token.service';
import { RequestService } from '../services/request.service';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-endorse',
  standalone: false,

  templateUrl: './endorse.component.html',
  styleUrl: './endorse.component.css'
})
export class EndorseComponent {
  application_id!: number;
  staff_id!: number;
  department_id!: string;

  constructor(
    public dialogRef: MatDialogRef<EndorseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private tokenService: TokenService,
    private requestService: RequestService,
    private snackbar: MatSnackBar,
    private router: Router,
    private applicationService: ApplicationService,
  ) {
    this.application_id = this.data.application_id;
    this.staff_id = this.tokenService.userIDToken(this.tokenService.decodeToken());
    this.department_id = this.tokenService.userRoleToken(this.tokenService.decodeToken());
  }


  confirm(): void {
    const department_id = this.department_id;
    const staff_id = this.staff_id;
    const approved = 'Approved';

    const data = {
      department_id: department_id,
      approved: approved,
      staff_id: staff_id,
      application_id: this.application_id
    }

    const departmentId = parseInt(department_id);

    if (departmentId === 7) {
      console.log("Department: ASDS")
      this.requestService.submitApprovalASDS(data).subscribe(
        (response) => {
          this.snackbar.open('Approval updated successfully.', '', {
            duration: 3000
          });
          this.applicationService.updateApprovalDetails(approved, this.application_id, departmentId)
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else if (departmentId === 8) {
      console.log("Department: SDS")
      this.requestService.submitApprovalSDS(data).subscribe(
        (response) => {
          this.snackbar.open('Approval updated successfully.', '', {
            duration: 3000
          });
          this.applicationService.updateApprovalDetails(approved, this.application_id, departmentId)
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else {
      console.log('No DepartmentId')
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}


