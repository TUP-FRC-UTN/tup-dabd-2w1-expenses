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


  deleteCategory(id: number): Observable<void> {
    const url=this.url+'/delete?id='+id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<void>(url, { headers });
  }
}
