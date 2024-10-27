import {
  Component,
  forwardRef,
  inject,
  Inject,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Distributions } from '../../models/distributions';
import { Expense } from '../../models/expense';
import { Owner } from '../../models/owner';
import { ExpenseCategory } from '../../models/expense-category';
import { ExpenseService } from '../../services/expensesServices/expense.service';
import { OwnerService } from '../../services/owner.service';
import { ProviderService } from '../../services/provider.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Provider } from '../../models/provider';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ExpenseGetById } from '../../models/expenseGetById';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Component({
  selector: 'app-expenses-register-expense',
  templateUrl: './expenses-register-expense.component.html',
  standalone: true,
  providers: [ExpenseService, OwnerService, ProviderService],
  imports: [
    FormsModule,
    DatePipe,
    NgFor,
    NgIf,
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    CurrencyMaskModule,
  ],
  styleUrls: ['./expenses-register-expense.component.css'],
})
export class ExpensesRegisterExpenseComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  // Modal states
  showModal = false;
  modalMessage = '';
  modalTitle = '';
  modalType: 'success' | 'error' = 'success';

  // Form validation
  formSubmitted = false;

  distributions: Distributions[] = [];
  expense: Expense = {
    description: '',
    providerId: 0,
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
  today: string = '';
  alreadysent = false;
  expenseCategoryList: ExpenseCategory[] = [];
  isEditMode = false;
  pageTitle = 'Registrar Gasto';

  private cdRef = inject(ChangeDetectorRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly propietarioService = inject(OwnerService);
  private readonly providerService = inject(ProviderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadInitialData();
    this.checkForEditMode();
  }
  checkForEditMode() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Gasto';
        this.loadExpense(id);
      }
    });
  }
 
  private loadExpense(id: number): void {
    this.expenseService.getById(id).subscribe({
      next: (expenseData: ExpenseGetById) => {
        console.log('Datos recibidos:', expenseData); // Para debug
        // Mapear la respuesta al modelo Expense
        this.mapExpenseDataToModel(expenseData);
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading expense', error);
        alert('No se pudo cargar el gasto');
        this.router.navigate(['/expenses']);
      }
    });
  }

  private mapExpenseDataToModel(data: ExpenseGetById): void {
    if (!data) {
      console.error('No se recibieron datos del gasto');
      return;
    }

    try {
      // Encontrar el ID del proveedor basado en la descripción
      const provider = this.listProviders.find(p => p.description === data.provider);
      
      // Encontrar el ID de la categoría basado en la descripción
      const category = this.expenseCategoryList.find(c => c.description === data.category);

      
      // Determinar el número de cuotas basado en installmentList
      const installments = data.installmentList?.length || 1;

      // Mapear al modelo Expense con validaciones para cada campo
      this.expense = {
        id: data.id ?? 0,
        description: data.description,
        providerId: 1,//TODO VER COMO MANEJAR PROVIDER
        expenseDate: this.formatDate(data.expenseDate ?? new Date().toISOString()),
        invoiceNumber: String(data.invoiceNumber ?? ''), // Convertir a string de manera segura
        typeExpense: this.mapExpenseType(data.expenseType ?? 'COMUN'),
        categoryId: Number(category?.id) || 0,
        amount: data.amount ?? 0,
        installments: installments,
        distributions: this.mapDistributions(data.distributionList)   
      };

      console.log('Expense mapeado:', this.expense); // Para debug
    } catch (error) {
      console.error('Error durante el mapeo:', error);
      // Inicializar con valores por defecto en caso de error
      this.initializeDefaultExpense();
    }
  }
  private mapDistributions(distributionList: any[]): Distributions[] {
    if (!distributionList?.length) return []; 
    return distributionList.map(dist => ({
      ownerId: dist.ownerId,
      proportion: (dist.proportion * 100) // Convertir a porcentaje
    }));
  }

  private initializeDefaultExpense(): void {
    this.expense = {
      description: '',
      providerId: 0,
      expenseDate: this.formatDate(new Date().toISOString()),
      invoiceNumber: '',
      typeExpense: 'COMUN',
      categoryId: 0,
      amount: 0,
      installments: 1,
      distributions: [],
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Si la fecha no es válida, retornar la fecha actual
        const today = new Date();
        return this.formatDateToString(today);
      }
      return this.formatDateToString(date);
    } catch {
      // En caso de error, retornar la fecha actual
      const today = new Date();
      return this.formatDateToString(today);
    }
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapExpenseType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'COMUN': 'COMUN',
      'INDIVIDUAL': 'INDIVIDUAL',
      'EXTRAORDINARIO': 'EXTRAORDINARIO'
    };
    return typeMap[type] || type;
  }
  loadInitialData() {
    this.initialForm();
  }
  //Inicializa el formulario con valores deseados
  initialForm() {
    this.loadOwners();
    this.loadProviders();
    this.loadDate();
    this.loadExpenseCategories();
    this.expense.providerId = 0;
    this.expense.typeExpense = 'COMUN';
    this.expense.providerId = 0;
    this.expense.installments = 1;
    this.expense.categoryId = 0;
    this.expense.installments = 1;
    this.expense.amount = 0;
    this.expense.distributions = [];
    this.expense.invoiceNumber = '';
    this.expense.description = '';
    this.selectedOwnerId = 0;
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
    this.today = `${yyyy}-${mm}-${dd}`;
    console.log(this.today);
    console.log(this.expense.expenseDate);
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
  repairDistributions(): void {
    this.expense.distributions.forEach((distribution) => {
      distribution.proportion = distribution.proportion * 100;
    });
  }
  clearForm(): void {
    this.cdRef.detectChanges();
    this.form.controls['amount'].markAsUntouched();
    this.form.controls['description'].markAsUntouched();
    this.form.controls['invoiceNumber'].markAsUntouched();
    this.form.controls['amount'].markAsPristine();
    this.form.controls['description'].markAsPristine();
    this.form.controls['invoiceNumber'].markAsPristine();
    this.formSubmitted = false;
    this.initialForm();
  }
  validateForm(): boolean {
    this.formSubmitted = true;

    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.controls[key];
        control.markAsTouched();
      });
      this.showErrorModal('Por favor, complete todos los campos requeridos.');
      return false;
    }

    if (this.expense.typeExpense === 'INDIVIDUAL') {
      if (this.expense.distributions.length === 0) {
        this.showErrorModal('Debe agregar al menos un propietario');
        return false;
      }
      if (!this.validateTotalProportion()) {
        this.showErrorModal('La suma de las proporciones debe ser igual a 100');
        return false;
      }
    }

    return true;
  }

  // Funciones para el modal
  showSuccessModal(message: string): void {
    this.modalTitle = 'Éxito';
    this.modalMessage = message;
    this.modalType = 'success';
    this.showModal = true;
  }

  showErrorModal(message: string): void {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.modalType = 'error';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    // Si fue un registro exitoso, limpiamos el formulario
    if (this.modalType === 'success') {
      this.clearForm();
    }
  }

  save(): void {
    if (!this.validateForm()) {
      return; // Evita múltiples envíos
    }
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
    const serviceCall = this.isEditMode
    ? this.expenseService.updateExpense(this.expense, this.selectedFile ?? undefined)
    : this.expenseService.registerExpense(this.expense, this.selectedFile ?? undefined);

    serviceCall.subscribe({
      next: (response) => {
        if (response && response.status === 200) {
          console.log(`${this.isEditMode ? 'Actualización' : 'Registro'} exitoso`);
          this.showSuccessModal(`Se ${this.isEditMode ? 'actualizó' : 'registró'} correctamente`);
          this.clearForm();
        } else {
          console.log('Respuesta inesperada', response);
          this.showErrorModal(`Error al ${this.isEditMode ? 'actualizar' : 'registrar'} el gasto`);
        }
      },
      error: (error) => {
        console.error(`Error al ${this.isEditMode ? 'actualizar' : 'registrar'} el gasto`, error);
        
        if (this.isEditMode) {
          // Errores específicos para actualización
          if (error.status === 400) {
            this.showErrorModal('Los datos de actualización son incorrectos. Verifique los campos.');
          } else if (error.status === 401) {
            this.showErrorModal('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.');
          } else if (error.status === 404) {
            this.showErrorModal('El gasto que intenta actualizar ya no existe.');
          } else if (error.status === 409) {
            this.showErrorModal('El gasto fue modificado por otro usuario. Por favor, recargue la página.');
          } else if (error.status === 422) {
            this.showErrorModal('Error en las distribuciones. Verifique que los datos sean correctos.');
          } else if (error.status === 500) {
            this.showErrorModal('Error en el servidor. Por favor, intente más tarde.');
          } else {
            this.showErrorModal('Error al actualizar el gasto.');
          }
        } else {
          // Errores específicos para nuevo registro
          if (error.status === 400) {
            this.showErrorModal('Los datos ingresados son incorrectos. Verifique los campos.');
          } else if (error.status === 401) {
            this.showErrorModal('No tiene autorización. Por favor, inicie sesión.');
          } else if (error.status === 409) {
            this.showErrorModal('Ya existe un gasto con este número de factura.');
          } else if (error.status === 422) {
            this.showErrorModal('Error en las distribuciones. La suma debe ser 100%.');
          } else if (error.status === 500) {
            this.showErrorModal('Error en el servidor. Por favor, intente más tarde.');
          } else {
            this.showErrorModal('Error al registrar el gasto.');
          }
        }
      },
      complete: () => {
        console.log('Operación completada');
      }
     });
  }
}
