import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from '../../../models/expenses-models/bill';
import { UserService } from '../userServices/user.service';

@Injectable({
  providedIn: 'root'
})
export class BillService {
 
  
  private apiUrl = 'http://localhost:8080/expenses/getByFilters';

  constructor(private http: HttpClient,private userService :UserService) {}

 
  deleteLogicBill(id: number): Observable<void> {
    const url = `http://localhost:8080/expenses?id=${id}&userId=${this.userService.getUserId()}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  createNoteOfCredit(failedBillId: number | null): Observable<void> {
    if (failedBillId === null) {
      throw new Error('El ID de la factura fallida no puede ser null.');
    }
    const url = `http://localhost:8080/expenses/note_credit?id=${failedBillId}&userId=${this.userService.getUserId()}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  getBillsByDateRange(formattedDateFrom: string, formattedDateTo: string) :Observable<Bill[]> {
    const urlWithFilters = `${this.apiUrl}?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    console.log(urlWithFilters)
    const response =  this.http.get<Bill[]>(urlWithFilters);
    return response
  }
  
}
