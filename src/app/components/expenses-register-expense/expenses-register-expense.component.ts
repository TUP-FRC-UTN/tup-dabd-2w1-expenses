import { Component, forwardRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Distributions } from '../../models/distributions';
import { Expense } from '../../models/expense';
import { Owner } from '../../models/owner';
import { ExpenseCategory } from '../../models/expense-category';
import { ExpenseService } from '../../services/expense.service';
import { OwnerService } from '../../services/owner.service';
import { ProviderService } from '../../services/provider.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Provider } from '../../models/provider';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-expenses-register-expense',
  templateUrl: './expenses-register-expense.component.html',
  standalone: true,
  providers:[ExpenseService,OwnerService,ProviderService],
  imports: [FormsModule, DatePipe, NgFor, NgIf, CommonModule,RouterOutlet],
  styleUrls: ['./expenses-register-expense.component.css']
})
export class ExpensesRegisterExpenseComponent implements OnInit {

  @ViewChild('form') form!: NgForm;
  
  distributions: Distributions[] = [];
  expense: Expense = {
    description: '',
    providerId: 1,
    expenseDate: new Date(), 
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

  private readonly expenseService = inject(ExpenseService)
  private readonly propietarioService = inject(OwnerService)
  private readonly providerService = inject(ProviderService)

  ngOnInit(): void {
    this.loadOwners();
    this.loadProviders();
    this.loadExpenseCategories();
  }
  toUpperCase() {
    this.expense.typeExpense = this.expense.typeExpense.toUpperCase();
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  allowOnlyPositiveNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57) && charCode !== 44) {
      event.preventDefault();
    }
    const inputValue: string = (event.target as HTMLInputElement).value;
    if (charCode === 44 && inputValue.includes(',')) {
      event.preventDefault();
    }
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
      distribution.proportion = distribution.proportion / 10;
    });
  }
  clearForm(): void {
    this.expense = {
      description: '',
      providerId: 1,
      expenseDate: new Date(),
      invoiceNumber: '',
      typeExpense: '',
      categoryId: 0,
      amount: 0,
      installments: 0,
      distributions: [],
    };
    this.selectedFile = null;
    this.selectedOwnerId = 0;
    this.alreadysent = false;
    this.form.resetForm();
  }

  save(): void {
    if (!this.validateTotalProportion()) {
      return;
    }

    this.prepareDistributions();
    this.expenseService
      .registerExpense(this.expense, this.selectedFile ?? undefined)
      .subscribe(
        (response) => {
          console.log('Gastoregistradoexitosamente', response);
        },
        (error) => {
          console.error('Error al registrar el gasto', error);
        }
      );
    this.clearForm();
  }

}
