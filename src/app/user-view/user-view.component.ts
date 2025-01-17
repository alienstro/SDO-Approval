import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EndorseComponent } from '../endorse/endorse.component';
import { Applicant, Assessment, BorrowersInformation, CoMakersInformation, LoanDetails } from '../interface/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../services/application.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DOC_URL } from '../constant';

@Component({
  selector: 'app-user-view',
  standalone: false,

  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css'
})
export class UserViewComponent {
  application_id!: number;
  applicant_id!: number;

  loanDetails: LoanDetails[] = [];
  borrowersInformation: BorrowersInformation[] = [{} as BorrowersInformation];
  coMakersInformation: CoMakersInformation[] = [{} as CoMakersInformation];
  assessmentDetails: Assessment[] = [{} as Assessment];
  applicantDetails: Applicant[] = [{} as Applicant];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private applicationService: ApplicationService,
    private domSanitizer: DomSanitizer
  ) {

  }

  goBack(): void {
    this.router.navigate(['/forward-view']);
  }

  openEndorse(): void {
    this.dialog.open(EndorseComponent, { width: '50rem', maxWidth: '50rem', height: '21.5rem', data: { application_id: this.application_id } })
  }

  transform(url: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  url = {
    authorityToDeduct: '',
    csc: '',
    emergency: '',
    idApplicant: '',
    idComaker: '',
    payslipApplicant: '',
    payslipComaker: ''
  }

  ngOnInit(): void {
    this.loanDetails = [history.state.loanDetails];
    this.application_id = this.loanDetails[0].application_id;
    this.applicant_id = this.loanDetails[0].applicant_id;

    console.log(this.application_id);

    this.url = {
      authorityToDeduct: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/authorityToDeduct.pdf`,
      csc: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/csc.pdf`,
      emergency: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/emergency.pdf`,
      idApplicant: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/idApplicant.pdf`,
      idComaker: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/idComaker.pdf`,
      payslipApplicant: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/payslipApplicant.pdf`,
      payslipComaker: `${DOC_URL}/${this.applicant_id}/documents/${this.application_id}/payslipComaker.pdf`,
    }

    this.applicationService.getBorrowersInformationById(this.application_id).subscribe(borrowers => {
      this.borrowersInformation = Array.isArray(borrowers) ? borrowers : [borrowers];
    })


    this.applicationService.getCoMakersInformationById(this.application_id).subscribe(comakers => {
      this.coMakersInformation = Array.isArray(comakers) ? comakers : [comakers];
    })

    this.applicationService.getAssessmentDetailsById(this.application_id).subscribe(assessment => {
      this.assessmentDetails = Array.isArray(assessment) ? assessment : [assessment];
      console.log(assessment)
    })

    this.applicationService.getLoanApplicantById(this.applicant_id).subscribe(applicant => {
      this.applicantDetails = Array.isArray(applicant) ? applicant : [applicant];
    })

    console.log(this.assessmentDetails[0]);
  }
}
