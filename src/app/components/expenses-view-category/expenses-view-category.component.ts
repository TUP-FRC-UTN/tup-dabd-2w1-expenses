import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Imports para el DataTable
import moment from 'moment';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';

// Modelos y Servicios
import { BillService } from '../../services/billServices/bill.service';
import { CategoryService } from '../../services/expensesCategoryServices/category.service';
import { Category } from '../../models/category';
import { ExpenseCategory } from '../../models/expense-category';

@Component({
  selector: 'app-expenses-view-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [BillService],
  templateUrl: './expenses-view-category.component.html',
  styleUrls: ['./expenses-view-category.component.scss']
})
export class ExpensesViewCategoryComponent implements OnInit {
  
  @ViewChild('modalEdit') modalEdit!: ElementRef;
  
  showAddModal = false;
  showEditModal = false;
  category: Category[] = [];
  expenseCategory: Category = new Category();
  selectedCategory: any = null;


  constructor(private cdRef: ChangeDetectorRef, private categoryService: CategoryService) {}

  ngOnInit(): void {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();
    this.filterData();
  }
  openEditModal(category: any): void {
    this.selectedCategory = { ...category }; // Copia los datos de la categoría para editar
    this.showEditModal = true; // Muestra el modal de edición
  }

  // Configura el DataTable y carga datos en caso de estar ya inicializado
  private configDataTable(): void {
    const tableSelector = '#myTable';
    const dataTable = $.fn.DataTable.isDataTable(tableSelector) 
      ? $(tableSelector).DataTable() 
      : $(tableSelector).DataTable({
          paging: true,
          searching: true,
          ordering: true,
          lengthChange: false,
          info: true,
          pageLength: 10,
          data: this.category,
          columns: this.getColumnsDefinition(),
          language: this.getLanguageSettings(),
        });

    this.loadTableData(dataTable);
    this.attachEditButtonHandler(dataTable);
  }

  // Define las columnas de la tabla
  private getColumnsDefinition() {
    return [
      { title: "ID", data: 'id', visible: false },
      { title: "Categoría", data: "description" },
      { 
        title: "Estado", 
        data: "estate",  // Cambiado de state a estate
        render: (data: string) => data // Renderiza el estado directamente
      },
      {
        title: "Fecha",
        data: "lastUpdatedDatetime",
        render: (data: string) => {
          return data ? moment(data).format('DD/MM/YYYY') : '';
        },
        type: 'date-moment'
      },
      {
        title: "Opciones",
        data: null,
        orderable: false,
        defaultContent: `
          <div class="dropdown">
            <button class="btn btn-light border border-black rounded-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              </svg>
            </button>
            <ul class="dropdown-menu">
              <li><button class="dropdown-item edit" (click)="openEditModal(category)">Editar</button></li>
              <li><button class="dropdown-item delete">Eliminar</button></li>
            </ul>
          </div>`
      }
    ];
  }

  // Configura las opciones de lenguaje del DataTable
  private getLanguageSettings() {
    return {
      processing: "Procesando...",
      search: "Buscar:",
      info: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 registros",
      zeroRecords: "No se encontraron resultados",
      emptyTable: "No hay datos disponibles en la tabla",
      paginate: {
        first: "Primero",
        previous: "Anterior",
        next: "Siguiente",
        last: "Último"
      }
    };
  }
  

  // Carga los datos en el DataTable
  private loadTableData(dataTable: any) {
    dataTable.clear();
    dataTable.rows.add(this.category);
    dataTable.draw();
  }

  // Asocia el evento de clic en el botón "Editar"
  private attachEditButtonHandler(dataTable: any) {
    $('#myTable tbody').on('click', '.edit', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = dataTable.row(row).data();
      this.editBill(rowData.id);
    });
  }

  // Filtra y carga las categorías
  filterData(): void {
    this.categoryService.getCategory().subscribe(
      (filteredCategory) => {
        this.category = filteredCategory; 
        this.configDataTable();
      },
      (error) => {
        console.error('Error al filtrar las categorías:', error);
      }
    );
  }
  
  editBill(id: number) {
    // Buscar la categoría por ID
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.expenseCategory = { ...this.expenseCategory };
        this.openModal(this.modalEdit);
      },
      error: (error) => {
        console.error('Error al obtener la categoría:', error);
      }
    });
  }

  updateCategory(form: NgForm): void {
    if (form.valid) {
      // Usamos expenseCategory en lugar de category ya que category es un array
      this.categoryService.updateCategory(this.expenseCategory).subscribe({
        next: () => {
          alert('Categoría actualizada con éxito');
          this.closeModal(this.modalEdit);
          this.filterData(); // Recargar los datos
        },
        error: (error) => {
          console.error('Error al actualizar la categoría:', error);
          alert('Error al actualizar la categoría');
        }
      });
    }
  }
  

  openModal(modal: ElementRef) {
    const element = modal.nativeElement;
    element.style.display = 'block';
    element.classList.add('show');
    document.body.classList.add('modal-open');
  }

  closeModal(modal: ElementRef) {
    const element = modal.nativeElement;
    element.style.display = 'none';
    element.classList.remove('show');
    document.body.classList.remove('modal-open');
    //// Limpiar el formulario
  }

  
}
