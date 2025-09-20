import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  Applicant,
  Assessment,
  BorrowersInformation,
  CoMakersInformation,
  Documents,
  LoanDetails,
  SignatureDetails,
} from '../interface/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../services/application.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DOC_URL } from '../constant';
import { EndorseComponent } from '../approve-dialog/approve-dialog.component';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-user-view',
  standalone: false,

  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
})
export class UserViewComponent {
  @ViewChild('pdfPreview', { static: false })
  pdfPreview!: ElementRef<HTMLIFrameElement>;

  @ViewChild('pdfPreviewAssessment', { static: false })
  pdfPreviewAssessment!: ElementRef<HTMLIFrameElement>;

  @ViewChild('pdfPreviewAuthorization', { static: false })
  pdfPreviewAuthorization!: ElementRef<HTMLIFrameElement>;

  private formPdfBytesLoan: ArrayBuffer | null = null;
  private formPdfBytesAssessment: ArrayBuffer | null = null;
  private formPdfBytesAuthorization: ArrayBuffer | null = null;

  application_id!: any;
  applicant_id!: any;
  noData: string = 'No Data Yet';

  currentUrl = '';

  roleId: number = 0;

  loanDetails?: any;
  borrowersInformation: BorrowersInformation[] = [{} as BorrowersInformation];
  coMakersInformation: CoMakersInformation[] = [{} as CoMakersInformation];
  assessmentDetails: Assessment[] = [{} as Assessment];
  applicantDetails: Applicant[] = [{} as Applicant];
  signatureDetails: SignatureDetails[] = [{} as SignatureDetails];
  documentsDetails: Documents[] = [{} as Documents];

  private pdfCache: { [key: string]: SafeResourceUrl } = {};

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private applicationService: ApplicationService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private http: HttpClient
  ) {
    this.roleId = Number(
      this.tokenService.userRoleToken(this.tokenService.decodeToken())
    );

    this.http
      .get('/Provident-Loan-Form_New-Template-2025-1.pdf', {
        responseType: 'arraybuffer',
      })
      .subscribe((bytes) => (this.formPdfBytesLoan = bytes));

    this.http
      .get('/Provident-Loan-Form_New-Template-2025-2.pdf', {
        responseType: 'arraybuffer',
      })
      .subscribe((bytes) => (this.formPdfBytesAssessment = bytes));

    this.http
      .get('/Provident-Loan-Form_New-Template-2025-3.pdf', {
        responseType: 'arraybuffer',
      })
      .subscribe((bytes) => (this.formPdfBytesAuthorization = bytes));
  }

  numberWithCommasAndDecimal(number: number) {
    if (!number || number === null) {
      return '';
    } else {
      return Number(number).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  numberToWordsWithDecimal(num: number): string {
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let words = this.numberToWords(integerPart).replace(/-/g, ' ');

    if (decimalPart > 0) {
      words += ' AND ' + this.numberToWords(decimalPart).replace(/-/g, ' ') + ' CENTAVOS';
    }

    return words.toUpperCase();
  }

  numberToWords(num: number): string {
    const a = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const b = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    const g = ['', 'thousand', 'million', 'billion', 'trillion'];

    const makeGroup = ([ones, tens, huns]: number[]): string => {
      return [
        huns === 0 ? '' : a[huns] + ' hundred ',
        tens === 0
          ? ''
          : tens === 1
            ? a[10 + ones]
            : b[tens] + (ones === 0 ? '' : '-' + a[ones]),
        tens === 1 ? '' : ones === 0 ? '' : tens === 0 ? a[ones] : '',
      ].join('');
    };

    const chunk = (n: number): number[][] => {
      const result = [];
      while (n > 0) {
        result.push([n % 10, ((n % 100) / 10) | 0, ((n % 1000) / 100) | 0]);
        n = Math.floor(n / 1000);
      }
      return result;
    };

    if (num === 0) return 'zero';

    return chunk(num)
      .map(makeGroup)
      .map((str, i) => (str ? str + ' ' + g[i] : ''))
      .filter(Boolean)
      .reverse()
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  formatDateToLong(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateToMonthYear(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }

  async convertBase64ToImage(pdfDoc: PDFDocument, base64: string) {
    if (!base64) return null;

    try {
      const imageData = base64.split(',')[1];
      const byteArray = Uint8Array.from(atob(imageData), (c) =>
        c.charCodeAt(0)
      );

      if (base64.includes('jpeg') || base64.includes('jpg')) {
        return await pdfDoc.embedJpg(byteArray);
      } else {
        return await pdfDoc.embedPng(byteArray);
      }
    } catch (error) {
      console.error('Error converting base64 to image:', error);
      return null;
    }
  }

  wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }

  // For Assessment Form
  async generateAndPreviewPdfAssessment() {
    console.log('working assessment button');

    if (!this.formPdfBytesAssessment) {
      console.error('PDF template not loaded yet.');
      return;
    }

    const pdfDoc = await PDFDocument.load(this.formPdfBytesAssessment);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed images first - make sure to await and handle null values
    const d_reviewed_signature = this.signatureDetails[0]?.signature_admin;
    const b_reviewed_signature = this.signatureDetails[0]?.signature_accounting;
    const a_reviewed_signature = this.signatureDetails[0]?.signature_asds;
    const a_processed_signature =
      this.signatureDetails[0]?.signature_accounting;
    const recommending_signature_asds =
      this.signatureDetails[0]?.signature_asds;
    const recommending_signature_sds = this.signatureDetails[0]?.signature_sds;

    const dReviewedSignatureImage = d_reviewed_signature
      ? await this.convertBase64ToImage(pdfDoc, d_reviewed_signature)
      : null;

    const bReviewedSignatureImage = b_reviewed_signature
      ? await this.convertBase64ToImage(pdfDoc, b_reviewed_signature)
      : null;

    const aReviewedSignatureImage = a_reviewed_signature
      ? await this.convertBase64ToImage(pdfDoc, a_reviewed_signature)
      : null;

    const aProcessedSignatureImage = a_processed_signature
      ? await this.convertBase64ToImage(pdfDoc, a_processed_signature)
      : null;

    const recommendingSignatureImageSDS = recommending_signature_sds
      ? await this.convertBase64ToImage(pdfDoc, recommending_signature_sds)
      : null;

    const recommendingSignatureImageASDS = recommending_signature_asds
      ? await this.convertBase64ToImage(pdfDoc, recommending_signature_asds)
      : null;

    // Prepare assessment data only
    const data = {
      // Documents Submitted: (Two copies of each)
      loan_application_form:
        this.assessmentDetails[0]?.loan_application_form === 'Yes',
      authorization_to_deduct:
        this.assessmentDetails[0]?.authorization_to_deduct === 'Yes',
      latest_pay_slip: this.assessmentDetails[0]?.latest_pay_slip === 'Yes',
      photocopy_of_id: this.assessmentDetails[0]?.photocopy_deped_id === 'Yes',
      approved_appointment:
        this.assessmentDetails[0]?.approved_appointment === 'Yes',
      document_showing_proof:
        this.assessmentDetails[0]?.proof_co_terminus === 'Yes',
      other_specify: !!this.assessmentDetails[0]?.others,
      other_specify_text: this.assessmentDetails[0]?.others,
      additional_documents:
        !!this.assessmentDetails[0]?.additional_documents ||
        !!this.assessmentDetails[0]?.letter_of_request ||
        !!this.assessmentDetails[0]?.hospitalization ||
        !!this.assessmentDetails[0]?.medical_abstract ||
        !!this.assessmentDetails[0]?.barangay,
      letter_request: this.assessmentDetails[0]?.letter_of_request === 'Yes',
      hospitalization: this.assessmentDetails[0]?.hospitalization === 'Yes',
      medical_abstract: this.assessmentDetails[0]?.medical_abstract === 'Yes',
      barangay_certificate: this.assessmentDetails[0]?.barangay === 'Yes',
      d_reviewed_by: [
        this.signatureDetails[0]?.admin_first_name ?? '',
        this.signatureDetails[0]?.admin_middle_name ?? '',
        this.signatureDetails[0]?.admin_last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      d_reviewed_designation: this.signatureDetails[0]?.admin_designation,
      d_reviewed_signature: dReviewedSignatureImage,
      d_date_reviewed: this.signatureDetails[0]?.admin_date
        ? new Date(this.signatureDetails[0].admin_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
        : '',

      // Completeness and Veracity of Submitted Documents
      signed_and_complete:
        this.assessmentDetails[0]?.signed_filled_laf === 'Yes',
      complete_supporting_documents:
        this.assessmentDetails[0]?.complete_supporting_documents === 'Yes',
      signatures_on_laf:
        this.assessmentDetails[0]?.authorized_signature_laf === 'Yes',
      c_reviewed_by: [
        this.signatureDetails[0]?.admin_first_name ?? '',
        this.signatureDetails[0]?.admin_middle_name ?? '',
        this.signatureDetails[0]?.admin_last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      c_reviewed_designation: this.signatureDetails[0]?.admin_designation,
      c_reviewed_signature: dReviewedSignatureImage,
      c_date_reviewed: this.signatureDetails[0]?.admin_date
        ? new Date(this.signatureDetails[0].admin_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
        : '',

      // Eligibility of the Borrower and Co-Maker
      borrower_will_not:
        this.assessmentDetails[0]?.borrower_reaches_retirement === 'Yes',
      borrower_age: this.assessmentDetails[0]?.borrowers_age,
      co_maker_will_not:
        this.assessmentDetails[0]?.comakers_reaches_retirement === 'Yes',
      co_maker_age: this.assessmentDetails[0]?.comakers_age,
      borrower_has_outstanding:
        this.assessmentDetails[0]?.borrowers_has_outstanding_balance === 'Yes',
      current_loan: !!this.assessmentDetails[0]?.current_loan_balance,
      current_loan_balance: Number(this.assessmentDetails[0]?.current_loan_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      past_due: !!this.assessmentDetails[0]?.past_due_loan,
      past_due_loans: Number(this.assessmentDetails[0]?.past_due_loan).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      no_of_years_months:
        this.assessmentDetails[0]?.number_of_years_past_due > 0 ||
        this.assessmentDetails[0]?.number_of_months_past_due > 0,
      no_of_years_text: this.assessmentDetails[0]?.number_of_years_past_due,
      no_of_months_text: this.assessmentDetails[0]?.number_of_months_past_due,
      borrower_net:
        this.assessmentDetails[0]?.borrowers_take_home_pay === 'Yes',
      for_renewal: this.assessmentDetails[0]?.paid_30_percent === 'Yes',
      percentage_of_principal:
        this.assessmentDetails[0]?.percentage_of_principal_paid,
      b_date_reviewed: this.signatureDetails[0].accounting_date
        ? new Date(this.signatureDetails[0].accounting_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
        : '',
      b_reviewed_signature: bReviewedSignatureImage,

      // Computation of Loan
      principal_amount: Number(this.assessmentDetails[0]?.principal_loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      outstanding_principal: Number(this.assessmentDetails[0]?.principal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      outstanding_interest: Number(this.assessmentDetails[0]?.interest).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      outstanding_balance: Number(this.assessmentDetails[0]?.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      net_proceeds: Number(this.assessmentDetails[0]?.net_proceeds).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      net_take_home_pay:
        Number(this.assessmentDetails[0]?.net_take_home_pay_after_deduction).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      monthly_amortization: Number(this.assessmentDetails[0]?.monthly_amortization).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      period_of_loan: this.assessmentDetails[0]?.period_of_loan,
      a_processed_signature: aProcessedSignatureImage,
      a_reviewed_signature: aReviewedSignatureImage,
      date_processed: this.assessmentDetails[0]?.computation_date_processed
        ? new Date(
          this.assessmentDetails[0]?.computation_date_processed
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        : '',
      remarks: this.assessmentDetails[0]?.remarks,

      // Recommending Approval
      recommending_signature_asds: recommendingSignatureImageASDS,
      recommending_signature_sds: recommendingSignatureImageSDS,
      date_asds: this.signatureDetails[0]?.asds_date
        ? new Date(this.signatureDetails[0]?.asds_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
        : '',

      date_sds: this.signatureDetails[0]?.sds_date
        ? new Date(this.signatureDetails[0]?.sds_date).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
        : '',
    };

    const fields = [
      {
        name: 'loan_application_form',
        x: 144.7,
        y: 222,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'authorization_to_deduct',
        x: 144.7,
        y: 233,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'latest_pay_slip',
        x: 144.7,
        y: 244.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'photocopy_of_id',
        x: 144.7,
        y: 255.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'approved_appointment',
        x: 144.7,
        y: 266.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'document_showing_proof',
        x: 144.7,
        y: 289,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'other_specify',
        x: 144.7,
        y: 322.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'other_specify_text', x: 235, y: 322.5, fontSize: 8 },
      {
        name: 'additional_documents',
        x: 485,
        y: 222,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'letter_request', x: 510.4, y: 233, fontSize: 8, checkbox: true },
      {
        name: 'hospitalization',
        x: 510.4,
        y: 244.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'medical_abstract',
        x: 510.4,
        y: 255,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'barangay_certificate',
        x: 510.4,
        y: 266.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'd_reviewed_by', x: 525, y: 323, fontSize: 8 },
      { name: 'd_reviewed_designation', x: 530, y: 331, fontSize: 8 },
      {
        name: 'd_reviewed_signature',
        x: 520,
        y: 308,
        fontSize: 8,
        isImage: true,
      },
      { name: 'd_date_reviewed', x: 620, y: 328, fontSize: 8 },

      // completeness and veracity of documents
      {
        name: 'signed_and_complete',
        x: 144.7,
        y: 376.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'complete_supporting_documents',
        x: 144.7,
        y: 387.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'signatures_on_laf',
        x: 144.7,
        y: 409.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'c_reviewed_by', x: 525, y: 415, fontSize: 8 },
      { name: 'c_reviewed_designation', x: 530, y: 423, fontSize: 8 },
      {
        name: 'c_reviewed_signature',
        x: 520,
        y: 398,
        fontSize: 8,
        isImage: true,
      },
      { name: 'c_date_reviewed', x: 620, y: 418, fontSize: 8 },

      // Eligibility of the Borrower and Co-Maker
      {
        name: 'borrower_will_not',
        x: 145.3,
        y: 460.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'borrower_age', x: 665, y: 460, fontSize: 8 },
      {
        name: 'co_maker_will_not',
        x: 145.3,
        y: 471.8,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'co_maker_age', x: 665, y: 471.8, fontSize: 8 },
      {
        name: 'borrower_has_outstanding',
        x: 145.3,
        y: 482.8,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'current_loan', x: 168.5, y: 494, fontSize: 8, checkbox: true },
      { name: 'current_loan_balance', x: 340, y: 494.5, fontSize: 8 },
      { name: 'past_due', x: 168.5, y: 505, fontSize: 8, checkbox: true },
      { name: 'past_due_loans', x: 340, y: 507, fontSize: 8 },
      {
        name: 'no_of_years_months',
        x: 192.5,
        y: 516.7,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'no_of_years_text', x: 391, y: 518, fontSize: 8 },
      { name: 'no_of_months_text', x: 501, y: 518, fontSize: 8 },
      { name: 'borrower_net', x: 144.3, y: 527.5, fontSize: 8, checkbox: true },
      { name: 'for_renewal', x: 145.3, y: 549.7, fontSize: 8, checkbox: true },
      { name: 'percentage_of_principal', x: 301, y: 564, fontSize: 8 },
      { name: 'b_date_reviewed', x: 620, y: 593, fontSize: 8 },
      {
        name: 'b_reviewed_signature',
        x: 507,
        y: 565,
        fontSize: 8,
        isImage: true,
      },

      // Computation of Loan
      { name: 'principal_amount', x: 293, y: 637, fontSize: 8 },
      { name: 'outstanding_principal', x: 207, y: 659, fontSize: 8 },
      { name: 'outstanding_interest', x: 207, y: 670, fontSize: 8 },
      { name: 'outstanding_balance', x: 307, y: 670, fontSize: 8 },
      { name: 'net_proceeds', x: 307, y: 682, fontSize: 8 },

      { name: 'net_take_home_pay', x: 640, y: 636, fontSize: 8 },
      { name: 'monthly_amortization', x: 640, y: 648, fontSize: 8 },
      { name: 'period_of_loan', x: 640, y: 659, fontSize: 8 },

      {
        name: 'a_processed_signature',
        x: 225,
        y: 681,
        fontSize: 8,
        isImage: true,
      },
      {
        name: 'a_reviewed_signature',
        x: 225,
        y: 740,
        fontSize: 8,
        isImage: true,
      },
      { name: 'date_processed', x: 485, y: 681, fontSize: 8 },
      { name: 'remarks', x: 415, y: 715, fontSize: 8 },

      // Recommending Approval
      {
        name: 'recommending_signature_asds',
        x: 195,
        y: 848,
        fontSize: 8,
        isImage: true,
      },
      {
        name: 'recommending_signature_sds',
        x: 550,
        y: 865,
        fontSize: 8,
        isImage: true,
      },

      { name: 'approved', x: 438, y: 857, fontSize: 8, checkbox: true },
      { name: 'disapproved', x: 438, y: 868, fontSize: 8, checkbox: true },

      { name: 'date_asds', x: 188, y: 915, fontSize: 8 },
      { name: 'date_sds', x: 538, y: 955.8, fontSize: 8 },
    ];

    const scaleX = width / 800;
    const scaleY = height / 1100;

    fields.forEach((f) => {
      let val = (data as any)[f.name];

      // HANDLE IMAGE EMBEDDING FOR SIGNATURE AND ADJUST HEIGHT AND WIDTH
      if (f.isImage && val) {
        const xPt = f.x * scaleX;
        const yPt = height - f.y * scaleY - 20;

        if (typeof val !== 'object' || typeof val.embed !== 'function') {
          console.warn(`Expected PDFImage for ${f.name}, but got`, val);
          return;
        }

        page.drawImage(val, {
          x: xPt,
          y: yPt,
          width: 80 * 0.8,
          height: 30 * 0.8,
        });
        return;
      }

      if (f.checkbox) {
        if (!val) return;
        val = 'X';
      } else {
        if (!val) return;
      }

      const xPt = f.x * scaleX;
      const yPt = height - f.y * scaleY - f.fontSize * scaleY;

      if (f.name === 'remarks' && val) {
        const lines = this.wrapText(val.toString(), 80);
        lines.forEach((line, i) => {
          page.drawText(line, {
            x: xPt,
            y: yPt - i * (f.fontSize + 0.7), // 0.7 is line spacing
            size: f.fontSize * scaleY,
            font,
          });
        });
        return;
      }

      // Add bold styling for specific fields
      const useBold = [
        'c_reviewed_by',
        'd_reviewed_by',
        'c_reviewed_designation',
        'd_reviewed_designation',
      ].includes(f.name);

      page.drawText(val.toString(), {
        x: xPt,
        y: yPt,
        size: f.fontSize * scaleY,
        font: useBold ? boldFont : font,
      });
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = pdfBytes.buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // set iframe source
    this.pdfPreviewAssessment.nativeElement.src = url;
  }

  // For Loan Application Form
  async generateAndPreviewPdf() {
    if (!this.formPdfBytesLoan) {
      console.error('PDF template not loaded yet.');
      return;
    }

    const pdfDoc = await PDFDocument.load(this.formPdfBytesLoan);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed images first - make sure to await and handle null values
    const borrowerSignature = this.borrowersInformation[0]?.signature;
    const coMakerSignature = this.coMakersInformation[0]?.co_signature;
    const hrSignature = this.signatureDetails[0]?.signature_hr;
    const legalSignature = this.signatureDetails[0]?.signature_legal;

    const borrowerSignatureImage = borrowerSignature
      ? await this.convertBase64ToImage(pdfDoc, borrowerSignature)
      : null;
    const coMakerSignatureImage = coMakerSignature
      ? await this.convertBase64ToImage(pdfDoc, coMakerSignature)
      : null;
    const hrSignatureImage = hrSignature
      ? await this.convertBase64ToImage(pdfDoc, hrSignature)
      : null;
    const legalSignatureImage = legalSignature
      ? await this.convertBase64ToImage(pdfDoc, legalSignature)
      : null;

    const data = {
      date_submitted: this.formatDateToLong(this.loanDetails[0].date_submitted),
      loan_amount: Number(this.loanDetails[0].loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      term: this.loanDetails[0].term,
      loan_application_number: this.loanDetails[0].loan_application_number,
      multi_purpose: this.loanDetails[0].type_of_loan.includes(
        'Multi-Purpose (new)'
      ),
      multi_purpose_new: this.loanDetails[0].type_of_loan.includes(
        'Multi-Purpose (new)'
      ),
      multi_purpose_renewal: this.loanDetails[0].type_of_loan.includes(
        'Multi-Purpose (renewal)'
      ),
      additional: this.loanDetails[0].type_of_loan.includes('Additional'),
      purpose_educational: this.loanDetails[0].purpose.includes('Educational'),
      purpose_hospitalization: this.loanDetails[0].purpose.includes(
        'Hospitalization/Medical'
      ),
      purpose_long_medication: this.loanDetails[0].purpose.includes(
        'Long Medication/Rehabilitation'
      ),
      purpose_house_arrears: this.loanDetails[0].purpose.includes(
        'House Repairs/Equity'
      ),
      purpose_house_repair_major: this.loanDetails[0].purpose.includes(
        'House Repair - Major'
      ),
      purpose_house_repair_minor: this.loanDetails[0].purpose.includes(
        'House Repair - Minor'
      ),
      purpose_payment: this.loanDetails[0].purpose.includes(
        'Payment of Loans from Private Institution'
      ),
      purpose_calamity: this.loanDetails[0].purpose.includes('Calamity'),
      purpose_others: this.loanDetails[0].purpose.includes('Others (specify)'),
      purpose_others_text: this.loanDetails[0].other_purpose,

      borrower_surname: this.borrowersInformation[0].last_name,
      borrower_first_name: this.borrowersInformation[0].first_name,
      borrower_mi: this.borrowersInformation[0].middle_initial,
      borrower_address:
        this.borrowersInformation[0].street +
        ', ' +
        this.borrowersInformation[0].province +
        ', ' +
        this.borrowersInformation[0].region,
      borrower_position: this.borrowersInformation[0].position,
      borrower_employee_no: this.borrowersInformation[0].employee_number,
      borrower_employment_status:
        this.borrowersInformation[0].employment_status,
      borrower_office: this.borrowersInformation[0].office,
      borrower_date_of_birth: this.borrowersInformation[0].date_of_birth,
      borrower_age: this.borrowersInformation[0].age,
      borrower_monthly_salary: this.numberWithCommasAndDecimal(this.borrowersInformation[0].monthly_salary),
      borrower_office_tel_no: this.borrowersInformation[0].office_tel_number,
      borrower_years_in_service: this.borrowersInformation[0].years_in_service,
      borrower_mobile_no: this.borrowersInformation[0].mobile_number,
      borrower_specimen_signature_1: borrowerSignatureImage,
      borrower_specimen_signature_2: borrowerSignatureImage,

      co_makers_surname: this.coMakersInformation[0].co_last_name,
      co_makers_first_name: this.coMakersInformation[0].co_first_name,
      co_makers_mi: this.coMakersInformation[0].co_middle_initial,
      co_makers_address:
        this.coMakersInformation[0].co_street +
        ', ' +
        this.coMakersInformation[0].co_province +
        ', ' +
        this.coMakersInformation[0].co_region,
      co_makers_position: this.coMakersInformation[0].position,
      co_makers_employee_no: this.coMakersInformation[0].co_employee_number,
      co_makers_employment_status:
        this.coMakersInformation[0].co_employment_status,
      co_makers_office: this.coMakersInformation[0].co_office,
      co_makers_date_of_birth: this.coMakersInformation[0].co_date_of_birth,
      co_makers_age: this.coMakersInformation[0].co_age,
      co_makers_monthly_salary: this.numberWithCommasAndDecimal(this.coMakersInformation[0].co_monthly_salary),
      co_makers_office_tel_no: this.coMakersInformation[0].co_office_tel_number,
      co_makers_years_in_service:
        this.coMakersInformation[0].co_years_in_service,
      co_makers_mobile_no: this.coMakersInformation[0].co_mobile_number,
      co_makers_specimen_signature_1: coMakerSignatureImage,
      co_makers_specimen_signature_2: coMakerSignatureImage,

      pesos_word: this.numberToWords(this.loanDetails[0].loan_amount),
      pesos_number: Number(this.loanDetails[0].loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      borrower_signature: borrowerSignatureImage,
      borrower_name: [
        this.borrowersInformation[0]?.first_name ?? '',
        this.borrowersInformation[0]?.middle_initial ?? '',
        this.borrowersInformation[0]?.last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      borrower_date: this.formatDateToLong(
        this.borrowersInformation[0]?.date.toString()
      ),
      co_makers_signature: coMakerSignatureImage,
      co_makers_name: [
        this.coMakersInformation[0]?.co_first_name ?? '',
        this.coMakersInformation[0]?.co_middle_initial ?? '',
        this.coMakersInformation[0]?.co_last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      co_makers_date: this.coMakersInformation[0]?.co_date
        ? this.formatDateToLong(this.coMakersInformation[0].co_date.toString())
        : '',

      personnel_signature: hrSignatureImage,
      personnel_name: [
        this.signatureDetails[0]?.hr_first_name ?? '',
        this.signatureDetails[0]?.hr_middle_name ?? '',
        this.signatureDetails[0]?.hr_last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      personnel_designation: this.signatureDetails[0]?.hr_designation,
      personnel_date: this.signatureDetails[0]?.hr_date
        ? this.formatDateToLong(this.signatureDetails[0]?.hr_date.toString())
        : '',
      permanent:
        typeof this.borrowersInformation[0]?.employment_status_hr ===
        'string' &&
        this.borrowersInformation[0].employment_status_hr.includes('permanent'),
      co_terminus:
        typeof this.borrowersInformation[0]?.employment_status_hr ===
        'string' &&
        this.borrowersInformation[0].employment_status_hr.includes(
          'co-terminus'
        ),
      net_pay: this.borrowersInformation[0].net_pay,
      year_of: this.borrowersInformation[0].payroll_date
        ? this.formatDateToMonthYear(
          this.borrowersInformation[0]?.payroll_date.toString()
        )
        : '',

      legal_signature: legalSignatureImage,
      legal_name: [
        this.signatureDetails[0]?.legal_first_name ?? '',
        this.signatureDetails[0]?.legal_middle_name ?? '',
        this.signatureDetails[0]?.legal_last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      legal_designation: this.signatureDetails[0]?.legal_designation,
      legal_date: this.signatureDetails[0]?.legal_date
        ? this.formatDateToLong(this.signatureDetails[0]?.legal_date.toString())
        : '',
    };

    const fields = [
      { name: 'date_submitted', x: 145, y: 193, fontSize: 8 },
      { name: 'loan_amount', x: 165, y: 214, fontSize: 8 },
      { name: 'term', x: 272, y: 238, fontSize: 8 },
      { name: 'loan_application_number', x: 590, y: 194, fontSize: 8 },
      { name: 'multi_purpose', x: 85.3, y: 248.5, fontSize: 8, checkbox: true },
      {
        name: 'multi_purpose_new',
        x: 97.5,
        y: 261,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'multi_purpose_renewal',
        x: 97.5,
        y: 273.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'additional', x: 86.8, y: 285.7, fontSize: 8, checkbox: true },
      {
        name: 'purpose_educational',
        x: 501,
        y: 222.8,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_hospitalization',
        x: 501,
        y: 232.8,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_long_medication',
        x: 501,
        y: 243,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_house_arrears',
        x: 501,
        y: 253.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_house_repair_major',
        x: 501,
        y: 264,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_house_repair_minor',
        x: 500.8,
        y: 274.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_payment',
        x: 500.7,
        y: 285.5,
        fontSize: 8,
        checkbox: true,
      },
      {
        name: 'purpose_calamity',
        x: 500.5,
        y: 296.5,
        fontSize: 8,
        checkbox: true,
      },
      { name: 'purpose_others', x: 501, y: 307.5, fontSize: 8, checkbox: true },
      { name: 'purpose_others_text', x: 582, y: 307.5, fontSize: 8 },

      { name: 'borrower_surname', x: 78, y: 348, fontSize: 8 },
      { name: 'borrower_first_name', x: 230, y: 348, fontSize: 8 },
      { name: 'borrower_mi', x: 370, y: 348, fontSize: 8 },
      { name: 'borrower_address', x: 130, y: 378, fontSize: 8 },
      { name: 'borrower_position', x: 110, y: 405, fontSize: 8 },
      { name: 'borrower_employee_no', x: 120, y: 425, fontSize: 8 },
      { name: 'borrower_employment_status', x: 310, y: 425, fontSize: 8 },
      { name: 'borrower_office', x: 100, y: 443, fontSize: 8 },
      { name: 'borrower_date_of_birth', x: 120, y: 463, fontSize: 8 },
      { name: 'borrower_age', x: 310, y: 464, fontSize: 8 },
      { name: 'borrower_monthly_salary', x: 145, y: 483, fontSize: 8 },
      { name: 'borrower_office_tel_no', x: 288, y: 474, fontSize: 8 },
      { name: 'borrower_years_in_service', x: 130, y: 502, fontSize: 8 },
      { name: 'borrower_mobile_no', x: 280, y: 493, fontSize: 8 },
      {
        name: 'borrower_specimen_signature_1',
        x: 90,
        y: 520,
        fontSize: 8,
        isImage: true,
      },
      {
        name: 'borrower_specimen_signature_2',
        x: 266,
        y: 520,
        fontSize: 8,
        isImage: true,
      },

      { name: 'co_makers_surname', x: 420, y: 348, fontSize: 8 },
      { name: 'co_makers_first_name', x: 570, y: 348, fontSize: 8 },
      { name: 'co_makers_mi', x: 707, y: 348, fontSize: 8 },
      { name: 'co_makers_address', x: 480, y: 378, fontSize: 8 },
      { name: 'co_makers_position', x: 460, y: 405, fontSize: 8 },
      { name: 'co_makers_employee_no', x: 472, y: 425, fontSize: 8 },
      { name: 'co_makers_employment_status', x: 660, y: 425, fontSize: 8 },
      { name: 'co_makers_office', x: 450, y: 443, fontSize: 8 },
      { name: 'co_makers_date_of_birth', x: 470, y: 463, fontSize: 8 },
      { name: 'co_makers_age', x: 662, y: 464, fontSize: 8 },
      { name: 'co_makers_monthly_salary', x: 497, y: 482, fontSize: 8 },
      { name: 'co_makers_office_tel_no', x: 638, y: 473, fontSize: 8 },
      { name: 'co_makers_years_in_service', x: 480, y: 502, fontSize: 8 },
      { name: 'co_makers_mobile_no', x: 630, y: 493, fontSize: 8 },
      {
        name: 'co_makers_specimen_signature_1',
        x: 450,
        y: 520,
        fontSize: 8,
        isImage: true,
      },
      {
        name: 'co_makers_specimen_signature_2',
        x: 625,
        y: 520,
        fontSize: 8,
        isImage: true,
      },

      { name: 'pesos_word', x: 65, y: 584, fontSize: 8 },
      { name: 'pesos_number', x: 280, y: 584, fontSize: 8 },
      { name: 'borrower_signature', x: 95, y: 715, fontSize: 8, isImage: true },
      { name: 'borrower_name', x: 80, y: 727, fontSize: 8 },
      { name: 'borrower_date', x: 310, y: 726, fontSize: 8 },
      {
        name: 'co_makers_signature',
        x: 440,
        y: 715,
        fontSize: 8,
        isImage: true,
      },
      {
        name: 'co_makers_name',
        x: 430,
        y: 728,
        fontSize: 8,
      },
      { name: 'co_makers_date', x: 665, y: 728, fontSize: 8 },

      { name: 'permanent', x: 100, y: 838, fontSize: 8, checkbox: true },
      { name: 'co_terminus', x: 175, y: 838, fontSize: 8, checkbox: true },
      { name: 'net_pay', x: 150, y: 862.5, fontSize: 8 },
      { name: 'year_of', x: 65, y: 874, fontSize: 8 },
      {
        name: 'personnel_signature',
        x: 190,
        y: 910,
        fontSize: 8,
        isImage: true,
      },
      { name: 'personnel_name', x: 210, y: 923, fontSize: 8 },
      { name: 'personnel_designation', x: 205, y: 945, fontSize: 8 },
      { name: 'personnel_date', x: 180, y: 957, fontSize: 8 },
      { name: 'legal_signature', x: 545, y: 910, fontSize: 8, isImage: true },
      { name: 'legal_name', x: 545, y: 923, fontSize: 8 },
      { name: 'legal_designation', x: 555, y: 945, fontSize: 8 },
      { name: 'legal_date', x: 530, y: 957, fontSize: 8 },
    ];

    const scaleX = width / 800;
    const scaleY = height / 1100;

    fields.forEach((f) => {
      let val = (data as any)[f.name];

      // HANDLE IMAGE EMBEDDING FOR SIGNATURE AND ADJUST HEIGHT AND WIDTH
      if (f.isImage && val) {
        const xPt = f.x * scaleX;
        const yPt = height - f.y * scaleY - 20;

        if (typeof val !== 'object' || typeof val.embed !== 'function') {
          console.warn(`Expected PDFImage for ${f.name}, but got`, val);
          return;
        }

        page.drawImage(val, {
          x: xPt,
          y: yPt,
          width: 80 * 0.8,
          height: 30 * 0.8,
        });
        return;
      }

      if (f.checkbox) {
        if (!val) return;
        val = 'X';
      } else {
        if (!val) return;
      }

      const xPt = f.x * scaleX;
      const yPt = height - f.y * scaleY - f.fontSize * scaleY;

      const useBold = [
        'borrower_name',
        'co_makers_name',
        'legal_name',
        'personnel_name',
      ].includes(f.name);

      page.drawText(val.toString(), {
        x: xPt,
        y: yPt,
        size: f.fontSize * scaleY,
        font: useBold ? boldFont : font,
      });
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = pdfBytes.buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // set iframe source
    this.pdfPreview.nativeElement.src = url;
  }

  // For Authorization To Deduct Form
  async generateAndPreviewPdfAuthorization() {
    console.log('working authorization button');

    if (!this.formPdfBytesAuthorization) {
      console.error('PDF template not loaded yet.');
      return;
    }

    const pdfDoc = await PDFDocument.load(this.formPdfBytesAuthorization);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const borrowerSignature = this.borrowersInformation[0]?.signature;

    const borrowerSignatureImage = borrowerSignature
      ? await this.convertBase64ToImage(pdfDoc, borrowerSignature)
      : null;

    const monthsTerm = this.loanDetails[0].term * 12;
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthName = nextMonth.toLocaleString('en-US', { month: 'long' });
    const currentYearTwoDigits = now.getFullYear().toString().slice(-2);

    // Prepare authorization data only
    const data = {
      deduction_amount_words: this.numberToWordsWithDecimal(
        this.computeMonthlyAmortization(
          this.loanDetails[0].loan_amount,
          this.loanDetails[0].term
        )
      ),
      deduction_amount: this.computeMonthlyAmortization(
        this.loanDetails[0].loan_amount,
        this.loanDetails[0].term
      ),
      deduction_months: monthsTerm,
      deduction_start_month: nextMonthName,
      deduction_start_year: currentYearTwoDigits,
      outstanding_loan_words: this.numberToWords(
        this.loanDetails[0].loan_amount
      ),
      outstanding_loan_amount: Number(this.loanDetails[0].loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      signature: borrowerSignatureImage,
      signature_name: [
        this.borrowersInformation[0]?.first_name ?? '',
        this.borrowersInformation[0]?.middle_initial ?? '',
        this.borrowersInformation[0]?.last_name ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase(),
      employee_no: this.borrowersInformation[0].employee_number,
      status: this.borrowersInformation[0].employment_status,
      designation: this.borrowersInformation[0].position,
      division: '',
      code: '',
      service: '',
    };

    const fields = [
      { name: 'deduction_amount_words', x: 425, y: 358, fontSize: 8 },
      { name: 'deduction_amount', x: 170, y: 371, fontSize: 12 },
      { name: 'deduction_months', x: 425, y: 371, fontSize: 12 },
      { name: 'deduction_start_month', x: 565, y: 371, fontSize: 12 },
      { name: 'deduction_start_year', x: 680, y: 371, fontSize: 12 },
      { name: 'outstanding_loan_words', x: 370, y: 392, fontSize: 8 },
      { name: 'outstanding_loan_amount', x: 115, y: 405, fontSize: 12 },
      { name: 'signature', x: 530, y: 508, fontSize: 12, isImage: true },
      { name: 'signature_name', x: 500, y: 522, fontSize: 12 },
      { name: 'employee_no', x: 220, y: 625, fontSize: 12 },
      { name: 'status', x: 392, y: 625, fontSize: 12 },
      { name: 'designation', x: 575, y: 625, fontSize: 12 },
      { name: 'division', x: 175, y: 642, fontSize: 12 },
      { name: 'code', x: 380, y: 642, fontSize: 12 },
      { name: 'service', x: 545, y: 642, fontSize: 12 },
    ];

    const scaleX = width / 800;
    const scaleY = height / 1100;

    fields.forEach((f) => {
      let val = (data as any)[f.name];

      if (f.isImage && val) {
        const xPt = f.x * scaleX;
        const yPt = height - f.y * scaleY - 20;

        if (typeof val !== 'object' || typeof val.embed !== 'function') {
          console.warn(`Expected PDFImage for ${f.name}, but got`, val);
          return;
        }

        page.drawImage(val, {
          x: xPt,
          y: yPt,
          width: 80,
          height: 30,
        });
        return;
      }

      if (val === undefined || val === null) return;

      const xPt = f.x * scaleX;
      const yPt = height - f.y * scaleY - f.fontSize * scaleY;

      // Add bold styling for specific fields
      const useBold = [
        'c_reviewed_by',
        'd_reviewed_by',
        'c_reviewed_designation',
        'd_reviewed_designation',
      ].includes(f.name);

      page.drawText(val.toString(), {
        x: xPt,
        y: yPt,
        size: f.fontSize * scaleY,
        font: useBold ? boldFont : font,
      });
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = pdfBytes.buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // set iframe source
    this.pdfPreviewAuthorization.nativeElement.src = url;
  }

  computeMonthlyAmortization(loan_amount: number, term: number) {
    const months = term * 12;

    const interest = loan_amount * term * 0.06;

    const total = interest + loan_amount;

    const monthlyAmortization = Number((total / months).toFixed(2));

    return monthlyAmortization;
  }

  goBack(): void {
    this.router.navigate(['/forward']);
  }

  transform(url: string): SafeResourceUrl {
    if (!this.pdfCache[url]) {
      this.pdfCache[url] =
        this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return this.pdfCache[url];
  }

  url = {
    csc: '',
    emergency: '',
    idApplicant: '',
    idComaker: '',
    payslipApplicant: '',
    payslipComaker: '',
  };

  openEndorse(): void {
    this.dialog.open(EndorseComponent, {
      data: { application_id: this.application_id },
    });
  }
  
  openReject(): void {
    console.log(this.loanDetails[0])

    this.dialog.open(RejectDialogComponent, {
     width: '50rem',
      maxWidth: '50rem',
      height: '16rem', 
      data: { application_id: this.application_id },
    });
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });

    this.loanDetails = [history.state.loanDetails];
    this.application_id = this.loanDetails[0].application_id;
    this.applicant_id = this.loanDetails[0].applicant_id;

    this.applicationService
      .getLoanDetailsById(this.application_id)
      .subscribe((loanDetails) => {
        // this.loanDetails = Array.isArray(loanDetails) ? loanDetails : [loanDetails];
        this.loanDetails = Array.isArray(loanDetails)
          ? loanDetails
          : [loanDetails];
        // this.loanDetails = this.loanDetails[0];
        console.log('loan details: ', this.loanDetails);
        this.applicant_id = this.loanDetails[0].applicant_id;
        console.log(this.applicant_id);
        console.log('department number', this.roleId);
        console.log('view application: ', this.application_id);

        this.applicationService
          .getBorrowersInformationById(this.application_id)
          .subscribe((borrowers) => {
            this.borrowersInformation = Array.isArray(borrowers)
              ? borrowers
              : [borrowers];
          });

        this.applicationService
          .getCoMakersInformationById(this.application_id)
          .subscribe((comakers) => {
            this.coMakersInformation = Array.isArray(comakers)
              ? comakers
              : [comakers];
          });

        this.applicationService
          .getAssessmentDetailsById(this.application_id)
          .subscribe((assessment) => {
            this.assessmentDetails = Array.isArray(assessment)
              ? assessment
              : [assessment];

            if (
              !this.assessmentDetails[0] ||
              this.assessmentDetails.length === 0 ||
              this.assessmentDetails[0].loan_application_form === undefined
            ) {
              this.assessmentDetails[0] = {
                ...this.assessmentDetails[0],
                loan_application_form: '',
              };
            }

            console.log(assessment);
          });

        this.applicationService
          .getLoanApplicantById(this.applicant_id)
          .subscribe((applicant) => {
            this.applicantDetails = Array.isArray(applicant)
              ? applicant
              : [applicant];
          });

        this.applicationService
          .getSignatureDetailsByApplicationId(this.application_id)
          .subscribe((signature) => {
            this.signatureDetails = Array.isArray(signature)
              ? signature
              : [signature];
          });

        this.applicationService
          .getDocumentsByApplicationId(this.application_id)
          .subscribe((documents) => {
            this.documentsDetails = Array.isArray(documents)
              ? documents
              : [documents];

            this.url = {
              csc: `${DOC_URL}/${this.documentsDetails[0].cscAppointment_path}`,
              emergency: `${DOC_URL}/${this.documentsDetails[0].emergency_path}`,
              idApplicant: `${DOC_URL}/${this.documentsDetails[0].idApplicant_path}`,
              idComaker: `${DOC_URL}/${this.documentsDetails[0].idComaker_path}`,
              payslipApplicant: `${DOC_URL}/${this.documentsDetails[0].payslipApplicant_path}`,
              payslipComaker: `${DOC_URL}/${this.documentsDetails[0].payslipComaker_path}`,
            };
          });

        console.log(this.assessmentDetails[0]);
      });
  }
}
