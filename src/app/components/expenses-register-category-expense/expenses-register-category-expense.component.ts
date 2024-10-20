import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ExpenseCategory } from '../../models/expense-category';
import { CategoryExpenseService } from '../../services/categoryExpensesServices/category-expense.service';

@Component({
  selector: 'app-expenses-register-category-expense',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expenses-register-category-expense.component.html',
  styleUrl: './expenses-register-category-expense.component.scss'
})
export class ExpensesRegisterCategoryExpenseComponent implements OnInit{
  
  ngOnInit(): void {
    this.getListExpenseCategoryes();
  }

  //inicializamos un objeto para que se guarde aca lo ingresado en el form
  expenseCategory : ExpenseCategory = {
    id: '',
    description:''
  }

  //array de todas las categorias que existen en el back
  listaExpenseCategoryes : ExpenseCategory[] = []

  //injectamos el service
  private readonly categoryExpenseService = inject(CategoryExpenseService);
  
  //este metodo es para cargar el array con todas las categorias ya existentes
  getListExpenseCategoryes(){
    this.categoryExpenseService.getAll();
  }

  //guardar caregoria
  save(form : NgForm) : void{
    if(form.invalid){
      alert("Formulario Invalido");
      return;
    }

    //aca iria otro if que verifica si la categoria ya existe en el back.(con la misma descripcion)
    //con un alert o algo del estilo form.value.descripcion == si esta en el array

    //se llama al metodo add del service pasandole como parametro el valor del form
    this.categoryExpenseService.add(form.value);
    form.reset();
  }
}
