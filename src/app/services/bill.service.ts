import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from '../models/bill';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:8080/expenses/getByFilters';

  constructor(private http: HttpClient) {}

  getBillsOnInit(): Observable<Bill[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    const dateTo = lastDayOfMonth.toISOString().split('T')[0];
    const urlWithFilters = `${this.apiUrl}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    return this.http.get<Bill[]>(urlWithFilters);
  }
  
}
