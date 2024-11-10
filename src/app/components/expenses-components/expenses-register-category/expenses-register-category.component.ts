import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Category } from '../../../models/expenses-models/category';
import { CategoryService } from '../../../services/expenses-services/expensesCategoryServices/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-register-category',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './expenses-register-category.component.html',
  styleUrl: './expenses-register-category.component.scss'
})
export class ExpenseRegisterCategoryComponent {

  private readonly categoryService = inject(CategoryService);

   category : Category = {
     description: '',
     id: 0,
     lastUpdatedDatetime: '',
     state: ''
   }
  @Output() eventSucces = new EventEmitter<void>();
  @Output() eventError = new EventEmitter<void>();

  clearInputs() {
   this.category.description=""
    }
  save() {
    if(this.category!=null)
    this.categoryService.add(this.category).subscribe({
      next: () => {
        this.eventSucces.emit()
        this.clearInputs()
      },
      error: () => {
        this.eventError.emit()
      }
    })
    }
}
