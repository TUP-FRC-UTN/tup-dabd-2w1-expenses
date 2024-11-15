import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {


     private userId:number=0

     //private userAuthService = inject(UserAuthenticationService)
constructor() { }

     
     getUserId(): number{
//hacer peticion al service auth y retornar el id
return 3;
     }

}
