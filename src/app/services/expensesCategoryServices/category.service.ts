import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Category} from '../../models/category';

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
    
    return this.http.post<Category>(this.url, expenseCategory.description)
  }

  deleteCategory(id: number): Observable<void> {
    const url=this.url+'/delete?id='+id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
  updateCategory(category: Category): Observable<any> {
    return this.http.put(`${this.url}/putById?id=${category.id}&description=${category.description}`, category);
  }
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.url}/${id}`);
  }

  editCategory(id:number):Observable<void>{
    const url=this.url+'/edit?id='+id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<void>(url, { headers });
  }
}
