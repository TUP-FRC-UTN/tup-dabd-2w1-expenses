import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseData } from '../../../models/expenses-models/ExpenseData';
import { CategoryData } from '../../../models/expenses-models/CategoryData';
import { kpiExpense } from '../../../models/expenses-models/kpiExpense';
import { LastBillRecord } from '../../../models/expenses-models/LastBillRecord';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private apiUrl = 'http://localhost:8080/reportchart/';

  constructor(private http: HttpClient) {}

  getExpenseData(yearFrom: number, yearTo: number): Observable<ExpenseData[]> {
    const url = `${this.apiUrl}yearmonth?start_year=${yearFrom}&end_year=${yearTo}`;
    return this.http.get<ExpenseData[]>(url);
  }

  getCategoryData(startDate: string, endDate: string): Observable<CategoryData[]> {
    const url = `${this.apiUrl}categoriesperiod?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<CategoryData[]>(url);
  }
  
  getKpiData(startDate: string, endDate: string): Observable<kpiExpense[]> {
    const url = `${this.apiUrl}expenseByTypeAndCategory?start_date=${startDate}&end_date=${endDate}`;
    return this.http.get<kpiExpense[]>(url);
  }

  getLastBillRecord():Observable<LastBillRecord>{
    const url = `${this.apiUrl}lastBillRecord`;
    return this.http.get<LastBillRecord>(url);
  }
}