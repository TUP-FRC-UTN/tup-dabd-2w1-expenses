import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/expensesCategoryServices/category.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-expenses-view-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CategoryService],
  template: `
    <section class="py-5">
      <div class="container p-3 border border-2 rounded shadow-lg">
        <!-- Botón de agregar -->
        <div class="row mb-3 text-end">
          <div class="col">
            <button class="btn btn-primary" (click)="addCategory()">
              <span class="bi-plus-lg"></span>
            </button>
          </div>
        </div>

        <!-- Fila de botones de filtro -->
        <div class="row mb-3">
          <!-- Barra de busqueda -->
          <div class="col">
            <input
              type="text"
              placeholder="Buscar"
              class="form-control"
              [(ngModel)]="searchTerm"
              (input)="onSearch($event)"
            >
          </div>

          <!-- Botones de exportar -->
          <div class="col-auto d-flex gap-1 text-end">
            <button (click)="exportToExcel()" id="exportExcelBtn" class="btn btn-success bi-file-earmark-excel"></button>
            <button (click)="exportToPDF()" id="exportPdfBtn" class="btn btn-danger bi-file-earmark-pdf"></button>
          </div>
        </div>

        <table id="myTable" class="table table-striped border border-3 rounded">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './expenses-view-category.component.scss',
})
export class ExpensesViewCategoryComponent implements OnInit {
  searchTerm: any;
  table: any;

  constructor(private cdRef: ChangeDetectorRef) {}
  private readonly categoryService = inject(CategoryService);

  category: Category[] = [];
  filterCategory: Category[] = [];
  expenseCategory: Category = new Category();

  filters = {
    categoryOrProviderOrExpenseType: '',
    expenseTypes: '',
  };

  ngOnInit(): void {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = function (d: string) {
      return moment(d, 'DD/MM/YYYY').unix();
    };

    this.configDataTable();
    this.filterData();
  }

  // Alert Templates
  showSuccessAlert(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#4caf50',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }

  showErrorAlert(message: string) {
    return Swal.fire({
      title: '¡Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#f44336',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }

  showDeleteConfirmation() {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        cancelButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      }
    });
  }

  showAddEditForm(title: string, category?: Category) {
    return Swal.fire({
      title: title,
      html: `
        <input id="swal-description" class="swal2-input" placeholder="Descripción" value="${category?.description || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: category ? 'Actualizar' : 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#9e9e9e',
      focusConfirm: false,
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg',
        cancelButton: 'px-4 py-2 text-white rounded-lg',
        popup: 'swal2-popup'
      },
      preConfirm: () => {
        const description = (document.getElementById('swal-description') as HTMLInputElement).value;
        if (!description) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }
        return { description };
      }
    });
  }

  filterData() {
    this.categoryService.getCategory().subscribe({
      next: (filteredCategory) => {
        this.category = filteredCategory;
        this.configDataTable();
      },
      error: (error) => {
        this.showErrorAlert('Error al filtrar las categorías');
        console.error('Error al filtrar las categorías:', error);
      }
    });
  }

  onSearch(event: any) {
    const searchValue = event.target.value;
    
    if (searchValue.length >= 3) {
      this.table.search(searchValue).draw();
    } else if (searchValue.length === 0) {
      this.table.search('').draw();
    }
  }

  async addCategory() {
    const result = await this.showAddEditForm('Agregar Categoría');
    
    if (result.isConfirmed) {
      this.expenseCategory.description = result.value.description;
      
      this.categoryService.add(this.expenseCategory).subscribe({
        next: () => {
          this.showSuccessAlert('Categoría agregada con éxito');
          this.filterData();
        },
        error: (error) => {
          this.showErrorAlert('Error al agregar la categoría');
          console.error('Error al agregar:', error);
        }
      });
    }
  }

  async editCategory(category: Category) {
    const result = await this.showAddEditForm('Editar Categoría', category);
    
    if (result.isConfirmed) {
      this.expenseCategory.id = category.id;
      this.expenseCategory.description = result.value.description;
      
      this.categoryService.updateCategory(this.expenseCategory).subscribe({
        next: () => {
          this.showSuccessAlert('Categoría actualizada con éxito');
          this.filterData();
        },
        error: (error) => {
          this.showErrorAlert('Error al actualizar la categoría');
          console.error('Error al actualizar:', error);
        }
      });
    }
  }

  async deleteCategory(id: number) {
    const result = await this.showDeleteConfirmation();
    
    if (result.isConfirmed) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.showSuccessAlert('Categoría eliminada con éxito');
          this.filterData();
        },
        error: (error) => {
          this.showErrorAlert('Error al eliminar la categoría');
          console.error('Error al eliminar:', error);
        }
      });
    }
  }

  // Export functions
  exportToExcel() {
    try {
      const data = this.category.map(item => ({
        Categoría: item.description,
        Estado: item.estate,
        'Última Actualización': moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Categorías');
      
      XLSX.writeFile(wb, 'categorias.xlsx');
      
      this.showSuccessAlert('Archivo Excel exportado con éxito');
    } catch (error) {
      this.showErrorAlert('Error al exportar a Excel');
      console.error('Error al exportar a Excel:', error);
    }
  }

  exportToPDF() {
    try {
      const doc = new jsPDF();
      
      const tableData = this.category.map(item => [
        item.description,
        item.estate,
        moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      ]);

      (doc as any).autoTable({
        head: [['Categoría', 'Estado', 'Última Actualización']],
        body: tableData,
      });

      doc.save('categorias.pdf');
      
      this.showSuccessAlert('Archivo PDF exportado con éxito');
    } catch (error) {
      this.showErrorAlert('Error al exportar a PDF');
      console.error('Error al exportar a PDF:', error);
    }
  }

  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'YYYY-MM-DD').unix();

    if ($.fn.DataTable.isDataTable('#myTable')) {
      let table = $('#myTable').DataTable();
      table.clear();
      table.rows.add(this.category);
      table.draw();
      return;
    }

    this.table = $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      lengthMenu: [10, 25, 50],
      pageLength: 10,
      data: this.category,
      columns: [
        { 
          title: 'ID', 
          data: 'id', 
          visible: false 
        },
        { 
          title: 'Categoría', 
          data: 'description',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        { 
          title: 'Estado', 
          data: 'state',
          className: 'align-middle',
          render: (data) => `<div>${data}</div>`
        },
        {
          title: 'Fecha',
          data: 'lastUpdatedDatetime',
          className: 'align-middle',
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        {
          title: 'Opciones',
          data: null,
          orderable: false,
          className: 'text-center',
          render: function (data, type, row) {
            return  `
            <div class="text-center">
              <div class="btn-group">
                <div class="dropdown">
                  <button type="button" class="btn border border-2 bi-three-dots-vertical" data-bs-toggle="dropdown"></button>
                  <ul class="dropdown-menu">
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-view">Ver más</a></li>
                    <li><a class="dropdown-item btn-edit">Editar</a></li>
                    <li><a class="dropdown-item btn-delete">Eliminar</a></li>
                  </ul>
                </div>
              </div>
            </div>`;
          }
        }
      ],
      dom: '<"mb-3"t><"d-flex justify-content-between"lp>',
      language: {
        lengthMenu: `
          <select class="form-select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>`,
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        loadingRecords: 'Cargando...',
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles en la tabla',
        paginate: {
          first: 'Primero',
          previous: 'Anterior',
          next: 'Siguiente',
          last: 'Último'
        }
      }
    });

    $('#myTable tbody').on('click', '.btn-view', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      this.showCategoryDetails(rowData);
    });

    $('#myTable tbody').on('click', '.btn-edit', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      this.editCategory(rowData);
    });

    $('#myTable tbody').on('click', '.btn-delete', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = this.table.row(row).data();
      this.deleteCategory(rowData.id);
    });
  }
  showCategoryDetails(category : Category) {
    Swal.fire({
        title: 'Detalles de la Categoría',
        html: `
            <div class="container-fluid p-0">
                <div class="row">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body p-0">
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <label class="fw-bold">ID:</label>
                                        <span class="ms-2">${category.id}</span>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <label class="fw-bold">Descripción:</label>
                                        <span class="ms-2">${category.description}</span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <label class="fw-bold">Última actualización:</label>
                                        <span class="ms-2">${moment(category.lastUpdatedDatetime).format('DD/MM/YYYY')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: '500px',
        padding: '20px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        customClass: {
            title: 'fs-4 fw-medium text-start mb-4',
            htmlContainer: 'text-start',
            popup: 'border-0',
            confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
    });
  }
}