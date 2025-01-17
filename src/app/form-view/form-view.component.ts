import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationService } from '../services/application.service';
import { BorrowersInformation, CoMakersInformation, LoanDetails } from '../interface/interfaces';
import { RequestService } from '../services/request.service';
import { SnackbarService } from '../services/snackbar.service';

@Component({
    selector: 'app-form-view',
    templateUrl: './form-view.component.html',
    styleUrl: './form-view.component.css',
    standalone: false
})
export class FormViewComponent implements OnInit {
  application_id: number = 0;

  coMakersInformation: CoMakersInformation | null = null;
  borrowersInformation: BorrowersInformation | null = null;
  loanDetails: LoanDetails | null = null;


  // loanDetailsForm!: FormGroup;
  // borrowerInfoForm!: FormGroup;
  // comakerInfoForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FormViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private applicationService: ApplicationService,
    private requestService: RequestService,
    private snackbarService: SnackbarService,
  ) {
    this.application_id = data.loan.application_id;
    this.loanDetails = data.loan;
    // console.log(this.loanDetails)
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  purposeArr = [
    "Hospitalization/Medical",
    "Long Medication/Rehabilitation",
    "House Repairs/Equity",
    "House Repair - Major",
    "House Repair - Minor",
    "Payment of Loans from Private Institution",
    "Calamity"
  ]

  private _formBuilder = inject(FormBuilder);

  loanDetailsForm = new FormGroup({
    loanAmount: new FormControl(0, [Validators.required]),
    loanNumber: new FormControl(0, [Validators.required]),
    purpose: new FormControl('', [Validators.required]),
    otherPurpose: new FormControl(''),
    term: new FormControl(0, [Validators.required]),
    loanType: new FormControl('', [Validators.required])
  })

  borrowerInfoForm = new FormGroup({
    lastName: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    middleName: new FormControl(''),
    region: new FormControl('', [Validators.required]),
    province: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    barangay: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    zipcode: new FormControl('', [Validators.required]),
    employeeNo: new FormControl('', [Validators.required]),
    employeeStatus: new FormControl('', [Validators.required]),
    birth: new FormControl('', [Validators.required]),
    age: new FormControl(0),
    office: new FormControl('', [Validators.required]),
    salary: new FormControl('', [Validators.required]),
    officeTelNo: new FormControl('', [Validators.required]),
    yearService: new FormControl(0, [Validators.required]),
    mobileNo: new FormControl('', [Validators.required]),
  })
  comakerInfoForm = new FormGroup({
    lastName: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    middleName: new FormControl(''),
    region: new FormControl('', [Validators.required]),
    province: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    barangay: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    zipcode: new FormControl('', [Validators.required]),
    employeeNo: new FormControl('', [Validators.required]),
    employeeStatus: new FormControl('', [Validators.required]),
    birth: new FormControl('', [Validators.required]),
    age: new FormControl(0),
    office: new FormControl('', [Validators.required]),
    salary: new FormControl('', [Validators.required]),
    officeTelNo: new FormControl('', [Validators.required]),
    yearService: new FormControl(0, [Validators.required]),
    mobileNo: new FormControl('', [Validators.required]),
  })
  isLinear = false;

  ngOnInit(): void {
    // Loan Details Binding
    // console.log('Loan Details:', this.loanDetails);
    if (this.loanDetails) {
      this.loanDetailsForm.patchValue({
        loanAmount: Number(this.loanDetails.loan_amount), 
        loanNumber: Number(this.loanDetails.loan_application_number),
        purpose: this.loanDetails.purpose,
        otherPurpose: '',
        term: Number(this.loanDetails.term),
        loanType: this.loanDetails.type_of_loan,
      });
      this.loanDetailsForm.markAllAsTouched(); 
    }

    // Borrower Information Binding
    this.applicationService.getBorrowersInformationById(this.application_id).subscribe(information => {

      if (information) { 
        const borrower = Array.isArray(information) ? information[0] : information;

        this.borrowerInfoForm.patchValue({
          lastName: borrower.last_name || '',
          firstname: borrower.first_name || '',
          middleName: borrower.middle_initial || '',
          region: borrower.region || '',
          province: borrower.province || '',
          city: borrower.city || '',
          barangay: borrower.barangay || '',
          street: borrower.street || '',
          zipcode: String(borrower.zipcode || ''),
          employeeNo: String(borrower.employee_number || ''),
          employeeStatus: borrower.employment_status || '',
          birth: borrower.date_of_birth || '',
          age: Number(borrower.age || 0),
          office: borrower.office || '',
          salary: String(borrower.monthly_salary || ''),
          officeTelNo: String(borrower.office_tel_number || ''),
          yearService: Number(borrower.years_in_service || 0),
          mobileNo: borrower.mobile_number || ''
        });
      } else {
        console.error('No borrower information received!');
      }
    });

    // Co-Maker Information Binding
    this.applicationService.getCoMakersInformationById(this.application_id).subscribe(information => {

      if (information) {
        const coMaker = Array.isArray(information) ? information[0] : information;

        console.log(coMaker);

        this.comakerInfoForm.patchValue({
          lastName: coMaker.co_last_name || '',
          firstname: coMaker.co_first_name || '',
          middleName: coMaker.co_middle_initial || '',
          region: coMaker.co_region || '',
          province: coMaker.co_province || '',
          city: coMaker.co_city || '',
          barangay: coMaker.co_barangay || '',
          street: coMaker.co_street || '',
          zipcode: String(coMaker.co_zipcode || ''),
          employeeNo: String(coMaker.co_employee_number || ''),
          employeeStatus: coMaker.co_employment_status || '',
          birth: coMaker.co_date_of_birth || '',
          age: Number(coMaker.co_age || 0),
          office: coMaker.co_office || '',
          salary: String(coMaker.co_monthly_salary || ''),
          officeTelNo: String(coMaker.co_office_tel_number || ''),
          yearService: Number(coMaker.co_years_in_service || 0),
          mobileNo: coMaker.co_mobile_number || ''
        });
      } else {
        console.error('No co-maker information received!');
      }
    });





    // console.log('Loan Form:', this.loanDetailsForm.value);
    // console.log('Borrower Form:', this.borrowerInfoForm.value);
    // console.log('Co-Maker Form:', this.comakerInfoForm.value);

    // console.log('Loan Form Valid:', this.loanDetailsForm.valid);
    // console.log('Borrower Form Valid:', this.borrowerInfoForm.valid);
    // console.log('Co-Maker Form Valid:', this.comakerInfoForm.valid);
  }


}
