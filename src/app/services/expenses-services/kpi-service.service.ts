import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { kpiExpense } from '../../models/expenses-models/kpiExpense';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KpiServiceService {
  private apiUrl = 'http://localhost:8080/reportchart/expenseByTypeAndCategory';
  constructor(private http: HttpClient){

  }
  getKpiData(startDate: string, endDate: string): Observable<kpiExpense[]> {
    const url = `${this.apiUrl}?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<kpiExpense[]>(url);
  }
  
}
