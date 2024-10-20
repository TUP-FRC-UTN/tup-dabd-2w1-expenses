import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseCategory } from '../../models/expense-category';

@Injectable({
  providedIn: 'root'
})
export class CategoryExpenseService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = "me lo tiene que pasar manu";

  constructor() { }

  //fijarme si anda
  add(expenseCategory: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(this.apiUrl, expenseCategory)
  }

  //fijarme si anda
  getAll(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(this.apiUrl);
  }
}
