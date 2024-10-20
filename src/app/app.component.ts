import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "ngx-dabd-2w1-core";
import { MenuItems } from 'ngx-dabd-2w1-core';
import { ViewGastosAdminComponent } from './components/expenses-view-gastos-admin/view-gastos-admin.component';
import { BillService } from './services/billServices/bill.service';
import { HttpClientModule } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

//imports para el Datatables (el segundo import termina en bs5 para que tenga 
//los estilos de bootstrap)
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

import { ExpensesRegisterExpenseComponent } from "./components/expenses-register-expense/expenses-register-expense.component";
import { ViewOwnerExpenseComponent } from "./components/expenses-view-owner/view-owner-expense/view-owner-expense.component";
import { appConfig } from './app.config';
import { ExpensesRegisterCategoryExpenseComponent } from "./components/expenses-register-category-expense/expenses-register-category-expense.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    ViewGastosAdminComponent,
    HttpClientModule,
    ExpensesRegisterExpenseComponent,
    ViewOwnerExpenseComponent,
    ExpensesRegisterCategoryExpenseComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {

  }
  title = 'Gastos';

  //navbar
  visibleSection: string = '';
  items: MenuItems[] = [
    { key: 'menu1', name: 'Registrar Gastos', active: true },
    { key: 'menu2', name: 'Consultar Gastos Administrador', active: true },
    { key: 'menu3', name: 'Consultar Gastos Propietarios', active: true },
    { key: 'menu4', name: 'Registrar Categoria Gasto', active: true } //esto lo tengo que borrar evetualmente
  ];

  //navbar
  onMenuVisited(key: string) {
    this.visibleSection = key;
  }

}
// Bootstrap la aplicación en modo standalone
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    ...appConfig.providers
  ]
})
.catch((err) => console.error(err));
