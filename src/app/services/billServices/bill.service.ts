import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from '../../models/bill';

@Injectable({
  providedIn: 'root'
})
export class BillService {
 
  
  private apiUrl = 'http://localhost:8080/expenses/getByFilters';

  constructor(private http: HttpClient) {}

  getBillsOnInit(): Observable<Bill[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()-2, 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    const dateTo = lastDayOfMonth.toISOString().split('T')[0];
    const urlWithFilters = `${this.apiUrl}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    return this.http.get<Bill[]>(urlWithFilters);
  }
  deleteLogicBill(id: number): Observable<void> {
    const url = 'http://localhost:8080/expenses?id='+id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  createNoteOfCredit(failedBillId: number | null) {
    const url = 'http://localhost:8080/expenses/note_credit?id='+failedBillId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  getBillsByDateRange(formattedDateFrom: string, formattedDateTo: string) :Observable<Bill[]> {
    const urlWithFilters = `${this.apiUrl}?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`;
    console.log(urlWithFilters)
    return this.http.get<Bill[]>(urlWithFilters);
  }
  
}
