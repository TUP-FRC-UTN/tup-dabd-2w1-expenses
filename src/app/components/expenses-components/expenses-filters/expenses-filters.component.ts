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

  // Agregamos un debounceTime para evitar múltiples emisiones rápidas
  private categoryChangeSubject = new Subject<void>();
  private providerChangeSubject = new Subject<void>();

  constructor() {
    // Suscripción para cambios en categorías
    this.categoryChangeSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.emitCategoryChange();
    });

    // Suscripción para cambios en proveedores
    this.providerChangeSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.emitProviderChange();
    });
  }

  limpiarFiltros() {
    this.selectedCategories=[]
    this.selectedProviders=[]
    }
  onCategoryChange(): void {
    this.categoryChangeSubject.next();
  }

  onProviderChange(): void {
    this.providerChangeSubject.next();
  }

  onTypeChange():void{
    this.selectedTypesChange.emit(this.selectedTypes)
  }

  private emitCategoryChange(): void {
    console.log('Emitting categories:', this.selectedCategories);
    this.selectedCategoriesChange.emit([...this.selectedCategories]);
  }

  private emitProviderChange(): void {
    const normalizedProviders = this.selectedProviders.map(provider => ({
      ...provider,
      id: Number(provider.id)
    }));
    console.log('Emitting providers:', normalizedProviders);
    this.selectedProvidersChange.emit(normalizedProviders);
  }
}
