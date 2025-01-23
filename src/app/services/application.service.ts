import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { Applicant, ApprovalDetails, Assessment, BorrowersInformation, CoMakersInformation, LoanApplication, LoanDetails, MergedLoanApplicationDetails, SignatureDetails } from '../interface/interfaces';
import { API_URL } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private _loanApplication = new BehaviorSubject<LoanApplication[]>([]);
  private _loanDetails = new BehaviorSubject<LoanDetails[]>([]);
  private _coMakersInformation = new BehaviorSubject<CoMakersInformation[]>([]);
  private _borrowersInformation = new BehaviorSubject<BorrowersInformation[]>([]);
  private _mergedLoanApplicationDetails = new BehaviorSubject<MergedLoanApplicationDetails[]>([]);
  private _assessmentForm = new BehaviorSubject<Assessment[]>([]);
  private _signatureDetails = new BehaviorSubject<SignatureDetails[]>([]);
  private _approvalDetails = new BehaviorSubject<ApprovalDetails[]>([]);

  loanApplication$ = this._loanApplication.asObservable();
  loanDetails$ = this._loanDetails.asObservable();
  coMakersInformation$ = this._coMakersInformation.asObservable();
  borrowersInformation$ = this._borrowersInformation.asObservable();
  mergedLoanApplicationDetails$ = this._mergedLoanApplicationDetails.asObservable();
  assessmentForm$ = this._assessmentForm.asObservable();
  signatureDetails$ = this._signatureDetails.asObservable();
  approvalDetails$ = this._approvalDetails.asObservable();

  constructor(private http: HttpClient) {
    forkJoin({
      loanDetails: this.getLoanDetails(),
      approvalDetails: this.getApprovalDetails()
    }).subscribe(({ loanDetails, approvalDetails }) => {
      this._loanDetails.next(loanDetails);
      this._approvalDetails.next(approvalDetails);
    });
  }

  /// GET BY URL

  getLoanApplication(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${API_URL}/loanApplicationApproval`);
  }

  getAssessmentDetails(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${API_URL}/getAssessmentDetails`);
  }

  getLoanDetails(): Observable<LoanDetails[]> {
    return this.http.get<LoanDetails[]>(`${API_URL}/getLoanDetailsSignature`);
  }

  getCoMakersInformation(): Observable<CoMakersInformation[]> {
    return this.http.get<CoMakersInformation[]>(`${API_URL}/coMakersInformation`);
  }

  getBorrowersInformation(): Observable<BorrowersInformation[]> {
    return this.http.get<BorrowersInformation[]>(`${API_URL}/borrowersInformation`);
  }

  getMergedLoanApplicationDetails(): Observable<MergedLoanApplicationDetails[]> {
    return this.http.get<MergedLoanApplicationDetails[]>(`${API_URL}/mergedLoanApplicationDetails`);
  }

  getSignatureDetails(): Observable<SignatureDetails[]> {
    return this.http.get<SignatureDetails[]>(`${API_URL}/getSignatureDetails`);
  }

  getApprovalDetails(): Observable<ApprovalDetails[]> {
    return this.http.get<ApprovalDetails[]>(`${API_URL}/getApprovalDetails`);
  }

  /// GET DATA BY ID

  getAssessmentDetailsById(applicationId: number): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${API_URL}/getAssessmentDetailsById/${applicationId}`);
  }

  getCoMakersInformationById(applicationId: number): Observable<CoMakersInformation[]> {
    return this.http.get<CoMakersInformation[]>(`${API_URL}/coMakersInformationById/${applicationId}`);
  }

  getBorrowersInformationById(applicationId: number): Observable<BorrowersInformation[]> {
    return this.http.get<BorrowersInformation[]>(`${API_URL}/borrowersInformationById/${applicationId}`);
  }

  getLoanApplicantById(applicantId: number): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(`${API_URL}/getApplicant/${applicantId}`);
  }

  /// GET DATA IN THE STATE

  getLoanApplicationState() {
    return this._loanApplication.getValue();
  }

  getLoanDetailsState() {
    return this._loanDetails.getValue();
  }

  getCoMakersInformationState() {
    return this._coMakersInformation.getValue();
  }

  getBorrowersInformationState() {
    return this._borrowersInformation.getValue();
  }

  getSignatureDetailsState() {
    return this._signatureDetails.getValue();
  }

  /// SET NEW DATA TO STATE

  setLoanApplicationState(setLoanApplicationState: LoanApplication[]) {
    this._loanApplication.next(setLoanApplicationState);
  }

  setLoanDetailsState(setLoanDetailsState: LoanDetails[]) {
    this._loanDetails.next(setLoanDetailsState);
  }

  setCoMakersInformationState(setCoMakersInformationState: CoMakersInformation[]) {
    this._coMakersInformation.next(setCoMakersInformationState);
  }

  setBorrowersInformationState(setBorrowersInformationState: BorrowersInformation[]) {
    this._borrowersInformation.next(setBorrowersInformationState);
  }

  setSignatureDetailsState(setSignatureDetailsState: SignatureDetails[]) {
    this._signatureDetails.next(setSignatureDetailsState);
  }

  /// UPDATE DATA

  updateSignatureDetails(signature: string, application_id: number): void {

    const currentSignatureDetails = this._signatureDetails.getValue();

    console.log(currentSignatureDetails);

    const index = currentSignatureDetails.findIndex(sig => sig.application_id === application_id);

    console.log(index);

    if (index !== -1) {
      currentSignatureDetails[index] = {
        ...currentSignatureDetails[index],
        signature_hr: signature
      };
    } else {
      console.log("Error Updating Signature Details")
    }

    this._signatureDetails.next([...currentSignatureDetails]);
  }

  updateApprovalDetails(approval: string, application_id: number, department_id: string): void {

    const currentApprovalDetails = this._approvalDetails.getValue();

    console.log(currentApprovalDetails);

    const index = currentApprovalDetails.findIndex(app => app.application_id === application_id);

    console.log(index);

    if (department_id === '7') {
      if (index !== -1) {
        currentApprovalDetails[index] = {
          ...currentApprovalDetails[index],
          status_asds: approval
        };
      } else {
        console.log("Error Updating Approval Details")
      }
    } else {
      if (index !== -1) {
        currentApprovalDetails[index] = {
          ...currentApprovalDetails[index], 
          status_sds: approval 
        };
      } else {
        console.log("Error Updating Approval Details")
      }
    }


    this._approvalDetails.next([...currentApprovalDetails]);
  }

}
