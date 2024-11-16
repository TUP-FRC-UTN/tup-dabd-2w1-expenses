import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Provider } from '../../../models/expenses-models/provider';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {


  private suppliersUrl: string='';
  constructor(private http: HttpClient) {
    this.suppliersUrl = environment.production
    ? environment.apisMock.suppliers
    : environment.apisMock.suppliers;
  }

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.suppliersUrl+'/suppliers').pipe(
      map((providers: any[]) => providers.map(provider => ({
        ...provider, 
        id: provider['id'], 
        description: provider['name'] || provider['description'] || 'Sin descripción' 
      })))
    );
  }

}
