import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Category } from '../../../models/expenses-models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../services/expenses-services/expensesCategoryServices/category.service';


@Component({
  selector: 'app-expenses-edit-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './expenses-edit-category.component.html',
  styleUrl: './expenses-edit-category.component.scss'
})
export class ExpensesEditCategoryComponent {
  private readonly categoryService = inject(CategoryService);

  @Input() category: Category = new Category();
  @Output() eventSuccess = new EventEmitter<void>();
  @Output() eventError = new EventEmitter<void>();

  edit() {
    if (this.category) {
      
      this.category.state = this.category.state === 'Activo' ? 'true' : 'false';

      this.categoryService.updateCategory(this.category).subscribe({
        next: () => {
          this.eventSuccess.emit();
        },
        error: () => {
          this.eventError.emit();
        }
      });
    }
  }
  toggleState() {
    this.category.state = this.category.state === 'Activo' ? 'Inactivo' : 'Activo';
  }
  limpiarCampos() {
    
    }

}