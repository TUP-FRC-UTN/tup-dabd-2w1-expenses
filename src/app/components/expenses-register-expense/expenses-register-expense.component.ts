import {
  Component,
  forwardRef,
  inject,
  Inject,
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
  today = new Date();
  alreadysent = false;
  expenseCategoryList: ExpenseCategory[] = [];

  private readonly expenseService = inject(ExpenseService);
  private readonly propietarioService = inject(OwnerService);
  private readonly providerService = inject(ProviderService);

  ngOnInit(): void {
    this.loadOwners();
    this.loadProviders();
    this.loadDate();
    this.loadExpenseCategories();
    this.expense.typeExpense = 'COMUN';
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

    if (
      (charCode < 48 || charCode > 57) &&
      charCode !== 44 &&
      charCode !== 102 &&
      charCode !== 70
    ) {
      event.preventDefault();
    }

    if (charCode === 44 && inputValue.includes(',')) {
      event.preventDefault();
    }
  }

  loadDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.expense.expenseDate = `${yyyy}-${mm}-${dd}`;
    
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
      { id: '1', description: 'Arreglo de camaras' },
      { id: '2', description: 'Pago de sueldos y jornales' },
      { id: '3', description: 'Factura de luz' },
      { id: '4', description: 'Factura de agua' },
      { id: '5', description: 'Factura de gas' },
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
    const owner = this.listOwner.find((o) => o.id === ownerId);
    return owner ? `${owner.name} ${owner.lastname}` : '';
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
    this.ngOnInit();
    this.alreadysent = false;
    this.form.resetForm();
  }

  save(): void {
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
          console.log('Gasto registrado exitosamente', response);
        },
        (error) => {
          console.error('Error al registrar el gasto', error);
        }
      );
    this.clearForm();
  }
}
