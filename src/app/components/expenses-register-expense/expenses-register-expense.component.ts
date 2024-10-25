import {
  Component,
  forwardRef,
  inject,
  Inject,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Distributions } from '../../models/distributions';
import { Expense } from '../../models/expense';
import { Owner } from '../../models/owner';
import { ExpenseCategory } from '../../models/expense-category';
import { ExpenseService } from '../../services/expensesServices/expense.service';
import { OwnerService } from '../../services/owner.service';
import { ProviderService } from '../../services/provider.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Provider } from '../../models/provider';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-expenses-register-expense',
  templateUrl: './expenses-register-expense.component.html',
  standalone: true,
  providers: [ExpenseService, OwnerService, ProviderService],
  imports: [FormsModule, DatePipe, NgFor, NgIf, CommonModule, RouterOutlet],
  styleUrls: ['./expenses-register-expense.component.css'],
})
export class ExpensesRegisterExpenseComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  distributions: Distributions[] = [];
  expense: Expense = {
    description: '',
    providerId: 1,
    expenseDate: '',
    invoiceNumber: '',
    typeExpense: '',
    categoryId: 0,
    amount: 0,
    installments: 0,
    distributions: this.distributions,
  };
  
  selectedFile: File | null = null;
  listOwner: Owner[] = [];
  selectedOwnerId: number = 0;
  listProviders: Provider[] = [];
  today:string='';
  alreadysent = false;
  expenseCategoryList: ExpenseCategory[] = [];
  private cdRef = inject(ChangeDetectorRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly propietarioService = inject(OwnerService);
  private readonly providerService = inject(ProviderService);

  ngOnInit(): void {
    this.loadOwners();
    this.loadProviders();
    this.loadDate();
    this.loadExpenseCategories();
    this.expense.typeExpense = 'COMUN';
    this.expense.providerId = 0;
    this.expense.installments = 1;  
  }
  toUpperCase() {
    this.expense.typeExpense = this.expense.typeExpense.toUpperCase();
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  allowOnlyPositiveNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const inputValue: string = (event.target as HTMLInputElement).value;
  
    // Permitir números, la tecla de borrar (backspace), y el punto decimal (.)
    if (
      (charCode < 48 || charCode > 57) && // No es un número
      charCode !== 46 && // Permitir el punto decimal
      charCode !== 8 // Permitir borrar
    ) {
      event.preventDefault();
    }
  
    // Evitar que se ingrese más de un punto decimal
    if (charCode === 46 && inputValue.includes('.')) {
      event.preventDefault();
    }
    if (inputValue.includes('.')) {
      const decimalPart = inputValue.split('.')[1];
      if (decimalPart && decimalPart.length >= 2) {
        event.preventDefault(); // No permitir más de 2 dígitos después del punto
      }
    }
  }

  loadDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.expense.expenseDate = `${yyyy}-${mm}-${dd}`;
    this.today=`${yyyy}-${mm}-${dd}`;
    
  }

  private loadOwners() {
    this.propietarioService.getOwners().subscribe({
      next: (owners: Owner[]) => {
        this.listOwner = owners;
      },
    });
  }
  private loadProviders() {
    this.providerService.getProviders().subscribe({
      next: (providers: Provider[]) => {
        this.listProviders = providers;

        console.log(this.listProviders);
      },
    });
  }
  private loadExpenseCategories() {
    this.expenseCategoryList = [
      { id: '1', description: 'Mantenimiento' },
      { id: '2', description: 'Servicios' },
      { id: '3', description: 'Reparaciones' },
      { id: '4', description: 'Administración' },
      { id: '5', description: 'Seguridad' },
    ];
  }
  public addDistribution(): void {
    if (this.selectedOwnerId !== 0) {
      const exists = this.expense.distributions.some(
        (distribution) => distribution.ownerId === this.selectedOwnerId
      );
      if (!exists) {
        this.alreadysent = false;
        const newDistribution = {
          ownerId: this.selectedOwnerId,
          proportion: 0,
        };
        this.expense.distributions.push(newDistribution);
      } else {
        this.alreadysent = true;
      }
      this.selectedOwnerId = 0;
    }
  }

  public getOwnerName(ownerId: number): string {
    const owner = this.listOwner.find((o) => o.id == ownerId);
    return owner ? `${owner.name} ${owner.lastname}` : '';
  }
  onProportionChange(value: number, index: number): void {
    // Mantener el valor actualizado al escribir, pero limitarlo en el evento `blur`
    this.distributions[index].proportion = value;
    this.validateTotalProportion();
  }
  
  onBlur(event: any, index: number): void {
    const value = this.distributions[index].proportion;
    if (value > 100) {
      this.distributions[index].proportion = 100;
    } else if (value < 1) {
      this.distributions[index].proportion = 1;
    }
    this.validateTotalProportion();
  }
  validateTotalProportion(): boolean {
    const total = this.expense.distributions.reduce(
      (sum, distribution) => sum + distribution.proportion,
      0
    );
    return total === 100;
  }
  public deleteDistribution(index: number): void {
    this.expense.distributions.splice(index, 1);
  }

  prepareDistributions(): void {
    this.expense.distributions.forEach((distribution) => {
      distribution.proportion = distribution.proportion / 100;
    });
  }
  clearForm(): void {
    this.alreadysent = false;
    this.form.resetForm();
    this.ngOnInit();
  }
  isSubmitting = false;
  save(): void {
    if (this.isSubmitting) {
      return; // Evita múltiples envíos
    }
    this.isSubmitting = true;
    if (this.expense.typeExpense === 'INDIVIDUAL') {
      if (!this.validateTotalProportion()) {
        return;
      }
      this.prepareDistributions();
    } else {
      // Si el tipo de gasto es COMUN o EXTRAORDINARIO, vaciamos las distribuciones
      this.expense.distributions = [];
    }

    // Llamamos al servicio para registrar el gasto
    this.expenseService
      .registerExpense(this.expense, this.selectedFile ?? undefined)
      .subscribe(
        (response) => {
          // Asegúrate de que estás verificando correctamente la estructura de la respuesta
          if(response && response.status === 200) {
            console.log('Respuesta exitosa');  // Esto te ayudará a ver si se ejecuta más de una vez
            alert('Se registró correctamente');
            this.clearForm();
          } else {
            console.log('Respuesta inesperada', response);
          }
          console.log('Gasto registrado exitosamente', response);
          this.isSubmitting = false; // Rehabilita el botón
        },
        (error) => {
          alert('Se produjo un error al registrar gastos');
          console.error('Error al registrar el gasto', error);
          this.isSubmitting = false; // Rehabilita el botón
        }
      );
  }
}
