import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CategoryService } from '../../../../services/expenses-services/expensesCategoryServices/category.service';
import { Category } from '../../../../models/expenses-models/category';
import { map, Subject, takeUntil } from 'rxjs';
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
  
  @Input() selectedCategories: Category[] =[];
  @Input() selectedCategory: number =0;
  @Input() multiple:Boolean=true;
  @Input() viewInactive : Boolean = false;
  @Output() selectedCategoriesChange = new EventEmitter<Category[]>();
  @Output() selectedCategoryChange = new EventEmitter<number>();

  categoryList : Category[]=[];
  private destroy$ = new Subject<void>();
 
  constructor(private categoryService:CategoryService){
  }
  ngOnInit(): void {
    this.loadCategories();
    
  }
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
  loadCategories(): void {
    if(this.viewInactive){
      this.categoryService.getCategory()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.categoryList = categories;
        }
      );
    }else{
      this.categoryService.getCategory()
      .pipe(
        takeUntil(this.destroy$),
        map((categories) => 
          categories.filter(category => category.state === 'Activo')
        )
      )
      .subscribe((categories) => {
        this.categoryList = categories;
        }
      );
    }
    
  }
  onCategoryChange(): void {
    if(this.multiple){
      this.selectedCategoriesChange.emit(this.selectedCategories);
    }else{
      this.selectedCategoryChange.emit(this.selectedCategory);
    }
  }
  
  set selectValue(value:any){
    if(this.multiple){
      this.selectedCategories = value;
    }else{
      this.selectedCategory = value;
    }
  }
  get selectValue(){
    return this.multiple ? this.selectedCategories : this.selectedCategory
  }
}
