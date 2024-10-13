import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "ngx-dabd-2w1-core";
import { MenuItems } from 'ngx-dabd-2w1-core';
import { ViewGastosAdminComponent } from './components/expenses-view-gastos-admin/view-gastos-admin.component';
import { BillService } from './services/bill.service';
import { HttpClientModule } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

//imports para el Datatables (el segundo import termina en bs5 para que tenga 
//los estilos de bootstrap)
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { ExpensesRegisterExpenseComponent } from "./components/expenses-register-expense/expenses-register-expense.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ViewGastosAdminComponent, HttpClientModule, ExpensesRegisterExpenseComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  
  constructor(public router: Router) {}
  
  ngOnInit(): void {
    
  }
  title = 'template-app';

  //navbar
  visibleSection: string = '';
  items: MenuItems[] = [
    {
      key: 'menu1',
      name: 'Listado de Gastos Admin',
      active: true,
    },
    {
      key: 'menu2',
      name: 'Registrar Gastos',
      active: true
    },
    {
      key: 'menu3',
      name: 'Listado de Gastos Propietarios',
      active: false,
      disabled: true
    }
  ];

  //navbar
  onMenuVisited(key: string) {
    this.visibleSection = key;
  }

}
// Bootstrap la aplicación en modo standalone
bootstrapApplication(AppComponent);
