import { Component, ElementRef, Inject, InjectionToken, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TokenService } from '../services/token.service';
import { RequestService } from '../services/request.service';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-approve-dialog',
  standalone: false,

  templateUrl: './approve-dialog.component.html',
  styleUrl: './approve-dialog.component.css',
})
export class EndorseComponent {
  @ViewChild('signaturePad', { static: true })
  signaturePadElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;
  signaturePad!: SignaturePad;

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
    private applicationService: ApplicationService
  ) {
    this.application_id = this.data.application_id;
    this.staff_id = this.tokenService.userIDToken(
      this.tokenService.decodeToken()
    );
    this.department_id = this.tokenService.userRoleToken(
      this.tokenService.decodeToken()
    );
  }

  ngAfterViewInit(): void {
    const canvas = this.signaturePadElement.nativeElement;

    canvas.width = 760;
    canvas.height = 145;

    this.signaturePad = new SignaturePad(canvas);
  }

  clearSignature(): void {
    this.signaturePad.clear();
  }

  uploadSignature(): void {
    this.signaturePad.clear();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageDataUrl = e.target?.result as string;
        this.loadImageToSignaturePad(imageDataUrl);
      };

      reader.readAsDataURL(file);
    }
  }

  loadImageToSignaturePad(imageDataUrl: string): void {
    const canvas = this.signaturePadElement.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        this.signaturePad.fromDataURL(canvas.toDataURL());
      };
      image.src = imageDataUrl;
    }
  }

  confirm(): void {
      if (this.signaturePad.isEmpty()) {
      this.snackbar.open(
        'Please provide a signature before confirming.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const department_id = this.department_id;
    const staff_id = this.staff_id;
    const approved = 'Approved';

     const signatureImage = this.signaturePad.toDataURL('image/png');

    const data = {
        signature: signatureImage,
      department_id: department_id,
      staff_id: staff_id,
      application_id: this.application_id,
    };

    const departmentId = parseInt(department_id);

    if (departmentId === 6) {
      console.log('Department: ASDS');
      this.requestService.submitSignatureASDS(data).subscribe(
        (response) => {
          this.snackbar.open('Approval updated successfully.', '', {
            duration: 3000,
          });
          this.applicationService.updateApprovalDetails(
            approved,
            this.application_id,
            departmentId
          );
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else if (departmentId === 7) {
      console.log('Department: SDS');
      this.requestService.submitSignatureSDS(data).subscribe(
        (response) => {
          this.snackbar.open('Approval updated successfully.', '', {
            duration: 3000,
          });
          this.applicationService.updateApprovalDetails(
            approved,
            this.application_id,
            departmentId
          );
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else {
      console.log('No DepartmentId');
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
