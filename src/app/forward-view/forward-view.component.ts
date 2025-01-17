import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApprovalDetails, LoanDetails, SignatureDetails } from '../interface/interfaces';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormViewComponent } from '../form-view/form-view.component';
import { ApplicationService } from '../services/application.service';
import { AssessViewComponent } from '../assess-view/assess-view.component';
import { EndorseComponent } from '../endorse/endorse.component';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-forward-view',
  templateUrl: './forward-view.component.html',
  styleUrls: ['./forward-view.component.css'],
  standalone: false,
})
export class ForwardViewComponent implements OnInit {
  loanDetails: LoanDetails[] = [];
  approvalDetails: ApprovalDetails[] = [];
  mergedDetails: any[] = [];
  roleId!: string;

  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  searchKey: string = '';
  filterStatus: string = '';

  displayedColumns: string[] = [
    'loan_details_id',
    'last_name',
    'first_name',
    'middle_name',
    'loan_amount',
    'type_of_loan',
    'purpose',
    'date_submitted',
    'action',
    'status',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private applicationService: ApplicationService,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.roleId = this.tokenService.userRoleToken(
      this.tokenService.decodeToken()
    );
  }

  openView(loan: LoanDetails): void {
    this.router.navigate(['/user-view'], { state: { loanDetails: loan } });
  }

  openFormDetails(loan: LoanDetails): void {
    this.dialog.open(FormViewComponent, {
      width: '90rem',
      maxWidth: '90rem',
      height: '55rem',
      data: { loan: loan },
    });
  }

  openAssessmentForm(loan: LoanDetails): void {
    this.dialog.open(AssessViewComponent, {
      width: '90rem',
      maxWidth: '90rem',
      height: '55rem',
      data: { loan: loan },
    });
  }

  openEndorse(loan: LoanDetails): void {
    this.dialog.open(EndorseComponent, {
      width: '50rem',
      maxWidth: '50rem',
      height: '21.5rem',
      data: { loan: loan },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateTableData(): void {
    this.mergedDetails = this.loanDetails.map((loan) => {
      const matchingApproval = this.approvalDetails.find(
        (app) => app.application_id === loan.application_id
      );
      return {
        ...loan,
        ...matchingApproval,
      };
    });
    console.log(this.mergedDetails)
    this.dataSource.data = this.mergedDetails;
  }

  applyFilter(): void {
    const searchValue = this.searchKey.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const status =  this.roleId === '7' ? data.status_asds : this.roleId === '8' ? data.status_sds : 'Pending';
      return (
        (data.last_name.toLowerCase().includes(searchValue) ||
          data.first_name.toLowerCase().includes(searchValue)) &&
        (!this.filterStatus || (status ? 'Approved' : 'Not Approved') === this.filterStatus)
      );
    };
    this.dataSource.filter = searchValue + this.filterStatus;
  }

  ngOnInit(): void {
    this.applicationService.getLoanApplication();

    this.applicationService.loanDetails$.subscribe((loan) => {
      this.loanDetails = loan;
      this.updateTableData();
    });

    this.applicationService.approvalDetails$.subscribe((approval) => {
      this.approvalDetails = approval;
      this.updateTableData();
    });
  }
}
