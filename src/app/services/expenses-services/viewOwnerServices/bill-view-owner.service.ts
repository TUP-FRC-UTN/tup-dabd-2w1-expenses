import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillViewOwner } from '../../../models/expenses-models/bill-view-owner.model';


@Injectable({
  providedIn: 'root'
})
export class BillViewOwnerService {
  private apiUrl = 'http://localhost:8080/api/expenses/distributions/getAllByOwnerId';

  constructor(
    private http: HttpClient
  ) {}

  getBillsWithProviders(ownerId: number, startDate: string, endDate: string): Observable<BillViewOwner[]> {
    const urlWithFilters = `${this.apiUrl}?id=${ownerId}&startDate=${startDate}&endDate=${endDate}`;
    
    return this.http.get<any[]>(urlWithFilters).pipe(
      map(response => response.map(item => this.mapToBillViewOwner(item)))
    );
  }

  private mapToBillViewOwner(item: any): BillViewOwner {
    return {
      id: item.id.toString(), // Convertimos el id a string ya que en el modelo lo requiere como string
      expenseId: item.expenseId,
      description: item.description,
      providerDescription: item.providerDescription,
      providerId: item.providerId,
      expenseDate: item.expenseDate, // Este ya viene como [number, number, number]
      expenseType: item.expenseType,
      categoryDescription: item.category.description,
      categoryId: item.category.id,
      amount: item.amount
    };
  }
}
