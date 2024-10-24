import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseYear } from '../../models/expenseReportModel/ExpenseYear';
import { ExpenseCategoryPeriod } from '../../models/expenseReportModel/ExpenseCategoryPeriod';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private apiUrl = 'http://localhost:8080/reportchart';

  constructor(private http: HttpClient) {}

  getYearMonth(startDate: string, endDate: string): Observable<ExpenseYear[]> {
    let params = new HttpParams().set('start_date', startDate).set('end_date', endDate);
    return this.http.get<ExpenseYear[]>(`${this.apiUrl}/yearmonth`, { params });
  }

  getCategoriesPeriod(startDate: string, endDate: string): Observable<ExpenseCategoryPeriod[]> {
    let params = new HttpParams().set('start_date', startDate).set('end_date', endDate);
    return this.http.get<ExpenseCategoryPeriod[]>(`${this.apiUrl}/categoriesperiod`, { params });
  }
}