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
  @Output() eventError = new EventEmitter<string>();

  validateDescription(): boolean {
    return !(this.category && this.category.description && this.category.description.trim());
  }
  edit() {
    if (this.category && this.category.description && this.category.description.trim()) {
      
      this.category.state = this.category.state === 'Activo' ? 'true' : 'false';

      this.categoryService.updateCategory(this.category).subscribe({
        next: () => {
          this.eventSuccess.emit();
        },
        error: (error) => {
          if (error.error) {
            switch (error.error.status) {
                case 409:
                    if (error.error.message === "A category with this description already exists") {
                        this.eventError.emit(`La categoría con la descripción '${this.category.description}' ya existe.`);
                    }
                    break;
                case 404:
                    if (error.error.message === "The category does not exist") {
                        this.eventError.emit(`La categoría que está modificando no existe.`);
                    }
                    break;
                case 400:
                    if (error.error.message === "The description is required") {
                        this.eventError.emit(`La descripción es requerida`);
                    }
                    break;
                default:
                    this.eventError.emit(`Se produjo un error al intentar modificar la categoría.`);
                    break;
            }
          } else {
              this.eventError.emit('Se produjo un error al intentar modificar la categoría');
          }
        }
      });
    }
  }
  toggleState() {
    this.category.state = this.category.state === 'Activo' ? 'Inactivo' : 'Activo';
  }
  

}