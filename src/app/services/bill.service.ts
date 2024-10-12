import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://6709f931af1a3998baa2b980.mockapi.io/bills/bills';

  constructor(private http: HttpClient) {}

  getBills(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
