import { Routes } from '@angular/router';
import { ExpensesRegisterExpenseComponent } from './components/expenses-register-expense/expenses-register-expense.component';
import { ViewGastosAdminComponent } from './components/expenses-view-gastos-admin/view-gastos-admin.component';
import { ViewOwnerExpenseComponent } from './components/expenses-view-owner/view-owner-expense/view-owner-expense.component';

export const routes: Routes = [
  { path: '', component:ViewGastosAdminComponent },
  { path: 'registerExpense', component: ExpensesRegisterExpenseComponent },
  { path: 'viewGastos', component: ViewOwnerExpenseComponent }  
];
