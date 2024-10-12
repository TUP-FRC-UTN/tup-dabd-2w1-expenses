import { Routes } from '@angular/router';
import { ExpensesRegisterExpenseComponent } from './components/expenses-register-expense/expenses-register-expense.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: ExpensesRegisterExpenseComponent },
  

];
