import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SideButton } from '../../../models/expenses-models/sideButton';
import { ExpensesSideButtonComponent } from '../expenses-side-button/expenses-side-button.component';

@Component({
  selector: 'app-expenses-navbar',
  standalone: true,
  imports: [ExpensesSideButtonComponent],
  templateUrl: './expenses-navbar.component.html',
  styleUrl: './expenses-navbar.component.scss'
})
export class ExpensesNavbarComponent { 
  //Expande el side
  expand: boolean = false;
  pageTitle: string = "Página Principal"

  constructor(private router: Router) { }
  // private readonly authService = inject(AuthService);

  // userRoles: string[] =  this.authService.getUser().roles!; 
  userRoles: string[] = ["Gerente", "Propietario"]

  //Traer con el authService
  actualRole : string = "Gerente"

  //Lista de botones
  buttonsList: SideButton[] = [];

  // setName(){
  //   return this.authService.getUser().name + " " + this.authService.getUser().lastname;
  // }

  async ngOnInit(): Promise<void> {
    this.buttonsList = [
      {
        //botón Listar Gastos para el Propietario
        icon: "bi bi-currency-dollar",
        title: "Mis Gastos",
        route: "viewExpenseOwner",
        roles: ["Propietario"]
      },
      {
        //Boton General para el Administrador (padre)
        icon: "bi bi-person-gear",
        title: "Gastos",
        roles: ["SuperAdmin", "Gerente Finanzas", "Gerente"],
        childButtons: [{
          //botón Listar Gastos para el Administrador
          icon: "bi bi-receipt-cutoff",
          title: "Visualizar",
          route: "viewExpenseAdmin",
          roles: ["SuperAdmin", "Gerente Finanzas", "Gerente"]
        },
        {
          //botón Lista Categoria de Gastos
          icon: "bi bi-list-task",
          title: "Categorías",
          route: "viewCategory",
          roles: ["SuperAdmin", "Gerente Finanzas", "Gerente"]
        },
        {
          //botón Registrar Gasto
          icon: "bi bi-journal-arrow-up",
          title: "Registrar",
          route: "registerExpense",
          roles: ["SuperAdmin", "Gerente Finanzas", "Gerente"]
        },
        {
          // botón Estadísticas
          icon: "bi bi-graph-up",
          title: "Reportes",
          route: "estadisticas",
          roles: ["SuperAdmin", "Gerente Finanzas", "Gerente"]
        }
        ]
      }
    ];
  }

  //Expandir y contraer el sidebar
  changeState() {
    this.expand = !this.expand;
  }

  redirect(path: string) {
    // if(path === '/login'){
    //   this.authService.logOut();
    //   this.router.navigate([path]);
    // }
    // else{
    //   this.router.navigate([path]);
    // }
    this.router.navigate([path]);
  }

  setTitle(title: string) {
    this.pageTitle = title;
  }
  
  selectRole(role : string){
    this.actualRole = role;
  }


}
