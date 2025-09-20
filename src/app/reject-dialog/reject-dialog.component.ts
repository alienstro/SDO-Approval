import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TokenService } from '../services/token.service';
import { RequestService } from '../services/request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-reject-dialog',
  standalone: false,

  templateUrl: './reject-dialog.component.html',
  styleUrl: './reject-dialog.component.css',
})
export class RejectDialogComponent {
  application_id!: number;
  staff_id!: number;
  department_id!: string;
  remarks_message!: string;

  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private tokenService: TokenService,
    private requestService: RequestService,
    private snackbar: MatSnackBar,
    private router: Router,
    private applicationService: ApplicationService
  ) {
    this.application_id = this.data.application_id;
    this.staff_id = this.tokenService.userIDToken(
      this.tokenService.decodeToken()
    );
    this.department_id = this.tokenService.userRoleToken(
      this.tokenService.decodeToken()
    );

    console.log('department id: ', this.department_id);
  }

  rejectApplicationOffice() {
    const department_id = this.department_id;
    const staff_id = this.staff_id;
    const departmentId = parseInt(department_id);
    const remarks = this.remarks_message;

    let data: any = [];

    if (departmentId === 5) {
      data = {
        application_id: this.application_id,
        department_id: department_id,
        staff_id: staff_id,
        remarks: remarks,
        office: 'ASDS',
      };

      console.log('ASDS');
    } else if (departmentId === 6) {
      data = {
        application_id: this.application_id,
        department_id: department_id,
        staff_id: staff_id,
        remarks: remarks,
        office: 'SDS',
      };
      console.log('SDS');
    } else {
      this.snackbar.open('Error Department Role', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.requestService.rejectApprovalApplication(data).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success) {
          this.snackbar.open('Rejected Application Successfully!', '', {
            duration: 3000,
          });
          this.dialogRef.close();
          this.applicationService.getLoanApplication();
          this.router.navigate(['/forward-view']);
        } else {
          this.snackbar.open('Failed to reject. Please try again.', '', {
            duration: 3000,
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.snackbar.open(
          'An error occurred while rejected the application.',
          '',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();

    // this.applicationService.getSignatureDetails();
    // const loanApplications = this.applicationService.getSignatureDetailsState();

    // const application = loanApplications.find(
    //   (app) => Number(app.application_id) === Number(this.application_id)
    // );

    // console.log('current application: ', application);
  }
}
