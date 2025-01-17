import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assessment } from '../interface/interfaces';
import { RequestService } from '../services/request.service';
import { SnackbarService } from '../services/snackbar.service';
import { ApplicationService } from '../services/application.service';


@Component({
  selector: 'app-assess-view',
  standalone: false,

  templateUrl: './assess-view.component.html',
  styleUrl: './assess-view.component.css'
})
export class AssessViewComponent implements OnInit {
  isLinear = true;
  reviewedBy: string = 'John Doe';
  application_id: number = 0;
  assessmentDetails!: Assessment;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AssessViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private applicationService: ApplicationService
  ) {
    this.application_id = data.loan.application_id;
  }

  ngOnInit(): void {
    this.initializeFormGroups();

    this.applicationService.getAssessmentDetailsById(this.application_id).subscribe((assessment) => {

      this.assessmentDetails = Array.isArray(assessment) ? assessment[0] : assessment;

      this.firstFormGroup.patchValue({
        loanApplicationForm: this.assessmentDetails.loan_application_form,
        authorizationToDeduct: this.assessmentDetails.authorization_to_deduct,
        latestPaySlip: this.assessmentDetails.latest_pay_slip,
        photocopyDepEdId: this.assessmentDetails.photocopy_deped_id,
        approvedAppointment: this.assessmentDetails.approved_appointment,
        proofCoTerminus: this.assessmentDetails.proof_co_terminus,
        othersSpecify: this.assessmentDetails.others || '',
        letterOfRequest: this.assessmentDetails.letter_of_request,
        hospitalization: this.assessmentDetails.hospitalization,
        medicalAbstract: this.assessmentDetails.medical_abstract,
        barangayCertificate: this.assessmentDetails.barangay,
        reviewedBy: this.assessmentDetails.reviewed_by || this.reviewedBy,
        reviewDate: this.assessmentDetails.date_processed || new Date().toISOString().substring(0, 16)
      });

      this.secondFormGroup.patchValue({
        signedFilledLaf: this.assessmentDetails.signed_filled_laf,
        completeSupportingDocs: this.assessmentDetails.complete_supporting_documents,
        authorizedSignatureLaf: this.assessmentDetails.authorized_signature_laf,
        reviewedBy: this.assessmentDetails.reviewed_by || this.reviewedBy,
        reviewDate: this.assessmentDetails.date_processed || new Date().toISOString().substring(0, 16)
      });

      this.thirdFormGroup.patchValue({
        borrowerReachesRetirement: this.assessmentDetails.borrower_reaches_retirement,
        borrowersAge: this.assessmentDetails.borrowers_age || 0,
        comakersReachesRetirement: this.assessmentDetails.comakers_reaches_retirement,
        comakersAge: this.assessmentDetails.comakers_age || 0,
        currentLoanBalance: this.assessmentDetails.current_loan_balance || 0,
        pastDueLoan: this.assessmentDetails.past_due_loan || 0,
        borrowersOutstandingPfLoan: this.assessmentDetails.borrowers_has_outstanding_balance,
        borrowersTakeHomePay: this.assessmentDetails.borrowers_take_home_pay,
        paid30Percent: this.assessmentDetails.paid_30_percent,
        percentageOfPrincipalPaid: this.assessmentDetails.percentage_of_principal_paid || 0,
        reviewedBy: this.assessmentDetails.reviewed_by || this.reviewedBy,
        reviewDate: this.assessmentDetails.date_processed || new Date().toISOString().substring(0, 16)
      });

      this.fourthFormGroup.patchValue({
        principalLoanAmount: this.assessmentDetails.principal_loan_amount || 0,
        netTakeHomePayAfterAmortization: this.assessmentDetails.net_take_home_pay_after_deduction || 0,
        monthlyAmortization: this.assessmentDetails.monthly_amortization || 0,
        periodOfLoan: this.assessmentDetails.period_of_loan || 0,
        dateProcessed: this.assessmentDetails.date_processed || new Date().toISOString().substring(0, 16),
        processedBy: this.assessmentDetails.processed_by || this.reviewedBy,
        reviewedBy: this.assessmentDetails.reviewed_by || this.reviewedBy,
        remarks: this.assessmentDetails.remarks || ''
      });

    });
  }

  initializeFormGroups(): void {
    this.firstFormGroup = this._formBuilder.group({
      loanApplicationForm: [false, Validators.required],
      authorizationToDeduct: [false, Validators.required],
      latestPaySlip: [false, Validators.required],
      photocopyDepEdId: [false, Validators.required],
      approvedAppointment: [false, Validators.required],
      proofCoTerminus: [false],
      othersSpecify: [''],
      letterOfRequest: [false, Validators.required],
      hospitalization: [false, Validators.required],
      medicalAbstract: [false, Validators.required],
      barangayCertificate: [false, Validators.required],
      reviewedBy: [this.reviewedBy, Validators.required],
      reviewDate: [new Date().toISOString().substring(0, 16), Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      signedFilledLaf: [false, Validators.required],
      completeSupportingDocs: [false, Validators.required],
      authorizedSignatureLaf: [false, Validators.required],
      reviewedBy: [this.reviewedBy, Validators.required],
      reviewDate: [new Date().toISOString().substring(0, 16), Validators.required]
    });

    this.thirdFormGroup = this._formBuilder.group({
      borrowerReachesRetirement: [false, Validators.required],
      borrowersAge: [0, Validators.required],
      comakersReachesRetirement: [false, Validators.required],
      comakersAge: [0, Validators.required],
      currentLoanBalance: [0, Validators.required],
      pastDueLoan: [0],
      borrowersOutstandingPfLoan: [false, Validators.required],
      borrowersTakeHomePay: [false, Validators.required],
      paid30Percent: [false],
      percentageOfPrincipalPaid: [0],
      reviewedBy: [this.reviewedBy, Validators.required],
      reviewDate: [new Date().toISOString().substring(0, 16), Validators.required]
    });

    this.fourthFormGroup = this._formBuilder.group({
      principalLoanAmount: [0, Validators.required],
      netTakeHomePayAfterAmortization: [0, Validators.required],
      monthlyAmortization: [0, Validators.required],
      periodOfLoan: [0, Validators.required],
      dateProcessed: [new Date().toISOString().substring(0, 16), Validators.required],
      processedBy: [this.reviewedBy, Validators.required],
      reviewedBy: [this.reviewedBy, Validators.required],
      remarks: ['']
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
