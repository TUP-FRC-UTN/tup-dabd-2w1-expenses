import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "ngx-dabd-2w1-core";
import { MenuItems } from 'ngx-dabd-2w1-core';

//imports para el Datatables (el segundo import termina en bs5 para que tenga 
//los estilos de bootstrap)
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { ExpensesRegisterExpenseComponent } from "./components/expenses-register-expense/expenses-register-expense.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ExpensesRegisterExpenseComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  
  constructor(public router: Router) {}
  
  ngOnInit(): void {
      //para iniciar el datatables, configuraciones basicas
      //se hace en el onInit para que se carge al cargar la pag
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10
    });
  }
  title = 'template-app';

  //navbar
  visibleSection: string = '';
  items: MenuItems[] = [
    {
      key: 'menu1',
      name: 'Lista Gastos',
      active: true,
      //icon: 'alarm' 
    },
    {
      key: 'menu2',
      name: 'Registrar Gastos',
      active: true
    },
    {
      key: 'menu3',
      name: 'disabled',
      active: false,
      disabled: true
    }
  ];

  //navbar
  onMenuVisited(key: string) {
    this.visibleSection = key;
  }
}

