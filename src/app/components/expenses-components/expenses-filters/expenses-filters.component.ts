import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseCategoriesNgSelectComponent } from "../expenses-categories-ngSelect/expense-categories-ng-select/expense-categories-ng-select.component";
import { Category } from '../../../models/expenses-models/category';
import { ExpenseProvidersNgSelectComponent } from "../expenses-providers-ngSelect/expense-providers-ng-select/expense-providers-ng-select.component";
import { Provider } from '../../../models/expenses-models/provider';
import { debounceTime, Subject } from 'rxjs';
import { ExpensesTypeExpenseNgSelectComponent } from "../expenses-type-expense-ng-select/expenses-type-expense-ng-select.component";
import { ExpenseType } from '../../../models/expenses-models/expenseType';

@Component({
  selector: 'app-expenses-filters',
  standalone: true,
  imports: [ExpenseCategoriesNgSelectComponent, ExpenseProvidersNgSelectComponent, ExpensesTypeExpenseNgSelectComponent],
  templateUrl: './expenses-filters.component.html',
  styleUrl: './expenses-filters.component.scss'
})
export class ExpensesFiltersComponent {

  @Input() selectedCategories: Category[] = [];
  @Input() selectedProviders: Provider[] = [];
  @Input() selectedTypes: ExpenseType[]=[];
  @Output() selectedCategoriesChange = new EventEmitter<Category[]>();
  @Output() selectedProvidersChange = new EventEmitter<Provider[]>();
  @Output() selectedTypesChange = new EventEmitter<ExpenseType[]>();


  limpiarFiltros() {
    this.selectedCategories=[]
    this.selectedProviders=[]
    }
  onCategoryChange(): void {
    //this.categoryChangeSubject.next();
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }

  onProviderChange(): void {
    //this.providerChangeSubject.next();
    this.selectedProvidersChange.emit(this.selectedProviders)
  }

  onTypeChange():void{
    this.selectedTypesChange.emit(this.selectedTypes)
  }
}
