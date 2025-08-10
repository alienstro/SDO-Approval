import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../constant';
interface LoginResponse {
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(API_URL + 'login', data);
  }

  // updateApprovalOSDS(data: any): Observable<any> {
  //   console.log(data);
  //   return this.http.patch(`${API_URL}` + `updateApprovalOSDS`, data);
  // }

  // submitSignatureHR(data: any): Observable<any> {
  //   return this.http.post(`${API_URL}` + `submitSignatureHR`, data);
  // }

  // submitSignatureAdmin(data: any): Observable<any> {
  //   return this.http.post(`${API_URL}` + `submitSignatureAdmin`, data);
  // }

  // submitSignatureLegal(data: any): Observable<any> {
  //   return this.http.post(`${API_URL}` + `submitSignatureLegal`, data);
  // }

  // submitApprovalASDS(data: any): Observable<any> {
  //   return this.http.post(
  //     `${API_URL}/loanApplication/submitApprovalASDS`,
  //     data
  //   );
  // }

  // submitApprovalSDS(data: any): Observable<any> {
  //   return this.http.post(`${API_URL}/loanApplication/submitApprovalSDS`, data);
  // }

  submitSignatureASDS(data: any): Observable<any> {
    return this.http.post(
      `${API_URL}/loanApplication/submitSignatureASDS`,
      data
    );
  }

  submitSignatureSDS(data: any): Observable<any> {
    return this.http.post(
      `${API_URL}/loanApplication/submitSignatureSDS`,
      data
    );
  }

  editPasswordStaff(data: any): Observable<any> {
    console.log('request service staff: ', data);
    return this.http.put(
      `${API_URL}` + `/staffUser/change-password/${data.staff_id}`,
      data
    );
  }
  // addLoanApplication(data: any): Observable<any> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(`${API_URL}/addLoanData`, data, { headers });
  // }

  // get<T>(endpoint: string) {
  //   return this.http.get<Response<T>>(`${API_URL}/${endpoint}`)
  // }
}
