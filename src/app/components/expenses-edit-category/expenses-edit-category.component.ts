import { Component, Input, SimpleChanges } from '@angular/core';
import { Category } from '../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

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
  @Input() category: Category | null = null;
  localCategory: Category | null = null;  // Copia local para edición

  ngOnInit() {
    this.initializeCategory();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['category']) {
      this.initializeCategory();
    }
  }

  private initializeCategory() {
    if (this.category) {
      this.localCategory = {...this.category};  // Crea una copia para edición
    }
  }
}