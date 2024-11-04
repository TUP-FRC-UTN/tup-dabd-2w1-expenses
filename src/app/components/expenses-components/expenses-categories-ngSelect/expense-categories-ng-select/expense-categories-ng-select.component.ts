import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CategoryService } from '../../../../services/expenses-services/expensesCategoryServices/category.service';
import { Category } from '../../../../models/expenses-models/category';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-categories-ng-select',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  providers:[CategoryService],
  templateUrl: './expense-categories-ng-select.component.html',
  styleUrl: './expense-categories-ng-select.component.scss'
})
export class ExpenseCategoriesNgSelectComponent implements OnInit, OnDestroy {
  constructor(private categoryService:CategoryService){}
  @Input() selectedCategories: Category[] =[];
  @Output() selectedCategoriesChange = new EventEmitter<Category[]>();
  categoryList : Category[]=[];
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.loadCategories();
    
  }
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
  loadCategories(): void {
    this.categoryService.getCategory()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.categoryList = categories;
        }
      );
  }
  onCategoryChange(): void {
    this.selectedCategoriesChange.emit(this.selectedCategories);
  }
  
}
