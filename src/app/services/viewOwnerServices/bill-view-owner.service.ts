import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillViewOwner } from '../../models/viewOwnerModel/bill-view-owner.model';

@Injectable({
  providedIn: 'root'
})
export class BillViewOwnerService {
  private apiUrl = 'http://localhost:8080/api/expenses/distributions/getAllByOwnerId';

  constructor(private http: HttpClient) {}

  getBillsByOwnerId(ownerId: number): Observable<BillViewOwner[]> {
    const url = `${this.apiUrl}?id=${ownerId}`;
    return this.http.get<any[]>(url).pipe(
      map((data: any[]) =>
        data.map(item => ({
          id: item.id,
          description: item.description,
          providerId: item.providerId,
          expenseDate: item.expenseDate,
          expenseType: item.expenseType,
          categoryDescription: item.category.description,
          amount: Number(item.amount)
        }))
      )
    );
  }
}
