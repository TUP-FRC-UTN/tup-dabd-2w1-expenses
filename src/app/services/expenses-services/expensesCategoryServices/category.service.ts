import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../../models/expenses-models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient) {}

  private url='http://localhost:8080/categories'

  getCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url+'/all');
  }

  add(expenseCategory: Category): Observable<Category> {
    console.log(expenseCategory);
    return this.http.post<Category>(`${this.url}/postCategory?description=${expenseCategory.description}`, expenseCategory.description);
}


  updateCategory(category: Category): Observable<any> {
    return this.http.put(
      `${this.url}/putById?id=${category.id}&description=${category.description}&enabled=${category.state}`,null);
  }
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${'http://localhost:8080/categories/getById'}/${id}`);
  }

}
