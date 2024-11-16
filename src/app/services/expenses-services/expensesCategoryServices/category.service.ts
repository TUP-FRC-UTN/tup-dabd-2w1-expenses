import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../../models/expenses-models/category';
import { UserService } from '../userServices/user.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient, private userService :UserService) {}

  private url='http://localhost:8080/categories'

  getCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url+'/all');
  }

  add(expenseCategory: Category): Observable<Category> {
    console.log(expenseCategory);
    const url = `${this.url}/postCategory?description=${expenseCategory.description}&userId=${this.userService.getUserId()}`;
    return this.http.post<Category>(url, expenseCategory);
  }
updateCategory(category: Category): Observable<any> {

  const url = `${this.url}/putById?id=${category.id}&description=${category.description}&enabled=${category.state}&userId=${this.userService.getUserId()}`;
  return this.http.put(url, null);
}

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${'http://localhost:8080/categories/getById'}/${id}`);
  }

}
