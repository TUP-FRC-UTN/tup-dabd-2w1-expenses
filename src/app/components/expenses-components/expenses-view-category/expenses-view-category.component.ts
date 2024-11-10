import {ChangeDetectorRef,Component,OnInit,inject} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import { Category } from '../../../models/expenses-models/category';
import { CategoryService } from '../../../services/expenses-services/expensesCategoryServices/category.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'bootstrap';
import 'jspdf-autotable';
import { ExpensesViewCategoryDetailsComponent } from '../expenses-view-category-details/expenses-view-category-details.component';
import { ExpensesEditCategoryComponent } from "../expenses-edit-category/expenses-edit-category.component";
import { ExpenseRegisterCategoryComponent } from "../expenses-register-category/expenses-register-category.component";
import { ExpensesStateCategoryNgSelectComponent } from "../expenses-state-category-ng-select/expenses-state-category-ng-select.component";
declare let bootstrap: any;
@Component({
  selector: 'app-expenses-view-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpensesViewCategoryDetailsComponent, ExpensesEditCategoryComponent, ExpenseRegisterCategoryComponent, ExpensesStateCategoryNgSelectComponent],
  providers: [CategoryService],
  templateUrl: './expenses-view-category.component.html',
  styleUrl: './expenses-view-category.component.scss',
})
export class ExpensesViewCategoryComponent implements OnInit {
  searchTerm: any;
  table: any;

  constructor(private cdRef: ChangeDetectorRef) {}
  private readonly categoryService = inject(CategoryService);

  selectedStates: any[]=[]
  categorySelected : Category = new Category();
  category: Category[] = [];
  filterCategory: Category[] = [];
  expenseCategory: Category = new Category();
  

  filters = {
    categoryOrProviderOrExpenseType: '',
    expenseTypes: '',
  };
  handleEditCancel() {
    throw new Error('Method not implemented.');
    }
    
  ngOnInit(): void {
    

    this.configDataTable();
    this.filterData();
  }

  // Alert Templates
  showSuccessAlert(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
    });
  }
  onStateChange() {
   this.loadCategory()
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
  loadAlertAndFilter(msg : string) {
   this.showSuccessAlert(msg)
   this.filterData()
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



  filterData() {
    this.categoryService.getCategory().subscribe({
      next: (filteredCategory) => {
        this.category = filteredCategory;
        this.loadCategory();
      },
      error: (error) => {
        this.showErrorAlert('Error al filtrar las categorías');
        console.error('Error al filtrar las categorías:', error);
      }
    });
  }
  clearFiltered(){
    this.selectedStates=[];
    this.loadCategory();
  }
  loadCategory() {
    const dataTable = $('#myTable').DataTable();
    let categoriasFiltered = this.filteredByState(this.selectedStates)
    dataTable.clear().rows.add(categoriasFiltered).draw();
  }
  filteredByState(selectedStates: any[]) : Category[] {
    console.log(selectedStates);
  if (selectedStates.length === 0) {
    return this.category;
  }

  return this.category.filter(m => {
    return selectedStates.some(state => state.description === m.state);
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

  


  // Export functions
  exportToExcel() {
    try {
      const data = this.category.map(item => ({
        Categoría: item.description,
        Estado: item.state,
        'Última Actualización': moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Categorías');
      
      XLSX.writeFile(wb,`categorias-${moment(new Date()).format('DD/MM/YYYY')}.xlsx`);
      
    
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
        item.state,
        moment(item.lastUpdatedDatetime).format('DD/MM/YYYY')
      ]);

      (doc as any).autoTable({
        head: [['Categoría', 'Estado', 'Última Actualización']],
        body: tableData,
      });

      doc.save(`categorias-${moment(new Date()).format('DD/MM/YYYY')}.pdf`);
      
      
    } catch (error) {
      this.showErrorAlert('Error al exportar a PDF');
      console.error('Error al exportar a PDF:', error);
    }
  }

  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'YYYY-MM-DD').unix();

    if ($.fn.DataTable.isDataTable('#myTable')) {
        $('#myTable').DataTable().clear().destroy();
    }

    this.table = $('#myTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        lengthMenu: [5,10,25, 50],
        pageLength: 5,
        data: this.category,
        columns: [
            {
                title: 'Fecha',
                data: 'lastUpdatedDatetime',
                className: 'align-middle',
                render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                type: 'date-moment'
            },
            { 
                title: 'Estado', 
                data: 'state',
                className: 'align-middle',
                render: (data) => {
                  if (data === 'Activo') {
                      return `<span class="badge bg-success text-white rounded-pill px-3">${data}</span>`;
                  } else {
                      return `<span class="badge bg-secondary text-white rounded-pill px-3">${data}</span>`;
                  }
              }
            },
            { 
                title: 'Categoría', 
                data: 'description',
                className: 'align-middle',
                render: (data) => `<div>${data}</div>`
            },
            {
                title: 'Acciones',
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
                            <li><a class="dropdown-item btn-view" style="cursor: pointer;">Ver más</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-edit" style="cursor: pointer;">Editar</a></li>
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
                <option value="5">5</option>
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
        }
    });

    $('#myTable tbody').on('click', '.btn-view', (event) => {
        const row = $(event.currentTarget).closest('tr');
        const rowData = this.table.row(row).data();
        if (rowData) {
            this.viewSelectedCategory(rowData);
        }
    });

    $('#myTable tbody').on('click', '.btn-edit', (event) => {
        const row = $(event.currentTarget).closest('tr');
        const rowData = this.table.row(row).data();
        if (rowData) {
            this.editCategory(rowData);
        }
    });
}


  editCategory(rowData: any) {
      this.categorySelected =rowData
      this.categoryService.getCategoryById(this.categorySelected.id).subscribe({
        next:(value : Category) =>{
          this.categorySelected= value
        },
      })
      this.cdRef.detectChanges();
      
      const modalElement = document.getElementById('categoryEditModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
  }
  viewSelectedCategory(rowData : any) {
    this.categorySelected=rowData
    this.cdRef.detectChanges();
    
    const modalElement = document.getElementById('categoryViewModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
  addCategory() {
    const modalElement = document.getElementById('categoryRegisterModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  handleEditSuccess() {
    const modalElement = document.getElementById('categoryEditModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal?.hide();
    this.showSuccessAlert('Categoría actualizada con éxito');
    this.filterData(); 
  }
  handleEditError() {
    this.showErrorAlert('Error al actualizar la categoría');
  }

}