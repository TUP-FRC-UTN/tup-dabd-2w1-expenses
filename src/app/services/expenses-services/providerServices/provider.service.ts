import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Provider } from '../../../models/expenses-models/provider';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  private apiUrl = 'https://67056d45031fd46a830fec8e.mockapi.io/G7/proveedores'; 

  constructor(private http: HttpClient) {}

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl).pipe(
      map(providers => providers.map(provider => ({
        ...provider,
        id: Number(provider.id) // Convertir id a número
      })))
    );
  }

}
