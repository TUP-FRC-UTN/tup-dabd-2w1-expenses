import { Routes } from '@angular/router';
import { ExpensesRegisterExpenseComponent } from './components/expenses-components/expenses-register-expense/expenses-register-expense.component';
import { ViewGastosAdminComponent } from './components/expenses-components/expenses-view-expense-admin/expenses-view-expense-admin.component';
import { ViewOwnerExpenseComponent } from './components/expenses-components/expenses-view-expense-owner/expenses-view-expense-owner.component';
import { ExpensesViewCategoryComponent } from './components/expenses-components/expenses-view-category/expenses-view-category.component';
import { ReportExpenseComponent } from './components/expenses-components/expenses-report/expenses-report.component';

export const routes: Routes = [
  { path: 'viewExpenseAdmin', component: ViewGastosAdminComponent },
  { path: 'registerExpense/:id', component: ExpensesRegisterExpenseComponent },
  { path: 'registerExpense', component: ExpensesRegisterExpenseComponent },
  { path: 'viewCategory', component: ExpensesViewCategoryComponent },
  { path: 'viewExpenseOwner', component: ViewOwnerExpenseComponent },
  { path: 'estadisticas', component: ReportExpenseComponent }
];

export default routes;