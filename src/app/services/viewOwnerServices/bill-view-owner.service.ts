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


  getBillsOnInit(): Observable<BillViewOwner[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    const dateTo = lastDayOfMonth.toISOString().split('T')[0];
    const urlWithFilters = `${this.apiUrl}?id=223&startDate=${dateFrom}&endDate=${dateTo}`;
    console.log(urlWithFilters)
    return this.http.get<BillViewOwner[]>(urlWithFilters);
  }
  getBillsByOwnerIdAndDateFromDateTo(ownerId: number, fechaDesde: string, fechaHasta: string) : Observable<BillViewOwner[]> {
     const urlWithFilters = `${this.apiUrl}?id=223&startDate=${fechaDesde}&endDate=${fechaHasta}`
    return this.http.get<BillViewOwner[]>(urlWithFilters);
  }
}
