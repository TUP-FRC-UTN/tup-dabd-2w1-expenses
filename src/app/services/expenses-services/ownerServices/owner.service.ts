import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Owner } from '../../../models/expenses-models/owner';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  //private apiUrl = 'https://67056d45031fd46a830fec8e.mockapi.io/G7/propietario'; 
   private ownersApiUrl: string='';
  constructor(private http: HttpClient) {
    this.ownersApiUrl = environment.production
    ? environment.apisMock.owners
    : environment.apisMock.owners;
  }

  getOwners(): Observable<Owner[]> {
     const url = `${this.ownersApiUrl}/owners`
    return this.http.get<any[]>(url).pipe(
      map((owners: any[]) => 
        owners.map(owner => ({
          id: owner.id,  
          name: owner.name,  
          lastname: owner.lastname, 
          fullName:owner.name+' '+owner.lastname+' '+ owner.dni 
        }))
      )
    );
  }
}
