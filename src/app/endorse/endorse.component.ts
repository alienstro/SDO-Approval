import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import SignaturePad from 'signature_pad';
import { ApplicationService } from '../services/application.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService } from '../services/request.service';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-endorse',
  standalone: true,

  templateUrl: './endorse.component.html',
  styleUrl: './endorse.component.css'
})
export class EndorseComponent {
  @ViewChild('signaturePad', { static: true }) signaturePadElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  signaturePad!: SignaturePad;

  application_id!: number;
  staff_id!: number;
  department_id!: string;

  constructor(
    public dialogRef: MatDialogRef<EndorseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private requestService: RequestService,
    private snackbar: MatSnackBar,
    private tokenService: TokenService,
    private applicationService: ApplicationService,
    private router: Router,
  ) {
    this.application_id = this.data.application_id;
    this.staff_id = this.tokenService.userIDToken(this.tokenService.decodeToken());
    this.department_id = this.tokenService.userRoleToken(this.tokenService.decodeToken());
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
      this.snackbar.open('Please provide a signature before confirming.');
      return;
    }

    console.log(this.application_id);

    const department_id = this.department_id;
    const staff_id = this.staff_id;

    const signatureImage = this.signaturePad.toDataURL('image/png');

    const data = {
      signature: signatureImage,
      department_id: department_id,
      staff_id: staff_id,
      application_id: this.application_id
    }

    if (department_id === "4") {
      console.log("Department: HR")
      this.requestService.submitSignatureHR(data).subscribe(
        (response) => {
          this.snackbar.open('Signature confirmed and uploaded successfully.', '', {
            duration: 3000
          });
         this.applicationService.updateSignatureDetails(signatureImage, this.application_id)
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else if (department_id === "5") {
      console.log("Department: Admin")
      this.requestService.submitSignatureAdmin(data).subscribe(
        (response) => {
          this.snackbar.open('Signature confirmed and uploaded successfully.', '', {
            duration: 3000
          });
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    } else {
      console.log("Department: Legal")
      this.requestService.submitSignatureLegal(data).subscribe(
        (response) => {
          this.snackbar.open('Signature confirmed and uploaded successfully.', '', {
            duration: 3000
          });
          this.dialogRef.close();
          this.router.navigate(['/forward-view']);
        },
        (error) => {
          console.error('Error uploading signature:', error);
          this.snackbar.open('Failed to upload signature.');
        }
      );
    }
  }

  cancel(): void {
    this.clearSignature();
    this.dialogRef.close();
  }

  // private sendToBackend(signatureImage: string): void {
  //   // Example POST request to backend
  //   const payload = { signature: signatureImage };

  //   fetch('https://your-backend-api-endpoint/signature', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(payload)
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('Signature uploaded successfully:', data);
  //       alert('Signature confirmed and uploaded.');
  //     })
  //     .catch(error => {
  //       console.error('Error uploading signature:', error);
  //       alert('Failed to upload signature.');
  //     });
  // }
}

