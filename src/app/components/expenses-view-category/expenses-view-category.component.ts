import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild  } from '@angular/core';

import { Bill } from '../../models/bill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

//Imports para el DataTable
import moment from 'moment';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { DistributionList } from '../../models/distributionList';
import { Instalmentlist } from '../../models/installmentList';
import { BillService } from '../../services/billServices/bill.service';
import { CategoryService } from '../../services/expensesCategoryServices/category.service';
import { ExpenseCategory } from '../../models/expense-category';

@Component({
  selector: 'app-expenses-view-category',
  standalone: true,
  imports: [CommonModule,FormsModule],
  providers: [BillService],
  templateUrl: './expenses-view-category.component.html',
  styleUrl: './expenses-view-category.component.scss'
})
export class ExpensesViewCategoryComponent implements OnInit {

  failedBillId: number =0;
  showErrorModal = false;
  @ViewChild('errorModal') errorModal: ElementRef | undefined;
  constructor(private cdRef: ChangeDetectorRef) {}
  private readonly categoryService = inject(CategoryService)
  category: ExpenseCategory[] = [];
  filterCategory: ExpenseCategory[] = [];
  filters ={
    categoryOrProviderOrExpenseType: '',
    expenseTypes: '',
  }
  
  //on init
  ngOnInit(): void {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = function (d: string) {
      return moment(d, 'DD/MM/YYYY').unix();  // Convertir la fecha a timestamp para que pueda ordenarse
    };

   this.configDataTable();
    this.filterData();
  }


  
  deleteCategory(id: any) {
    this.categoryService.deleteCategory(id)
      .subscribe(
        () => {
          console.log(`Categoria con ID ${id} eliminada con éxito.`);
          alert('Se elimino con exito la categoria')
          this.filterData();
        },
        //reutilizo esto o lo saco?
        /*(error) => {
          console.error(`Error al eliminar la categoria con ID ${id}:`, error);
          if(error.error.status==409 && error.error.message=="Expense has related bill installments"){
            this.showModalToNoteCredit();
            this.failedBillId=id
          }
          else{
            alert('Se elimino con exito el gasto')
          }
          
        }*/
      );
  }

  showModalToNoteCredit() {
    this.showErrorModal = true;
    this.cdRef.detectChanges();
    setTimeout(() => {
      const modalElement = document.getElementById('errorModal');
      if (modalElement) {
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
      }
    }, 0);
  }

  filterData() {
      
      debugger
      this.categoryService.getCategory().subscribe(
        (filteredCategory) => {
          this.category = filteredCategory; 
          this.configDataTable();
        },
        (error) => {
          console.error('Error al filtrar las categotias:', error);
        }
      );
  }
  
  loadCategoryFiltered() {
    const dataTable = $('#myTable').DataTable();
    dataTable.clear();
    dataTable.rows.add(this.category);
    dataTable.draw();
    
  }
  // formatDate(date: string) {
  // const parsedDate = new Date(date);
  // parsedDate.setHours(0, 0, 0, 0)
  // const year = parsedDate.getFullYear();
  // const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0')
  // const day = parsedDate.getDate().toString().padStart(2, '0'); 
  // return `${year}-${month}-${day}`;
  // }

  closeModal() {
    this.showErrorModal = false;
    if (this.errorModal) {
      this.errorModal.nativeElement.style.display = 'none';
      this.errorModal.nativeElement.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
    this.cdRef.detectChanges();
    this.loadCategoryFiltered();
  }

  /*
  deleteWithNoteCredit() {
    this.billService.createNoteOfCredit(this.failedBillId)
      .subscribe(
        () => {
          console.log(`Gasto con ID ${this.failedBillId} se le creo nota de credito con exito`);
          this.filterData();
          alert('Se realizo la nota de credito con exito')
          this.closeModal();
        },
        (error) => {
          console.error(`Error al realizar la nota de credito del gasto con ID ${this.failedBillId}:`, error);
          alert('No se pudo realizar la nota de credito con exito')
          this.showModalToNoteCredit();
        }
      );
  }*/
  configDataTable(){
    // Verifica si la tabla ya está inicializada, si es así, destrúyela antes de reinicializar
    
    if ($.fn.DataTable.isDataTable('#myTable')) {
      let table = $('#myTable').DataTable();
      table.clear();
      table.rows.add(this.category);
      table.draw();
      return;  // Salir de la función después de actualizar los datos
    }
    // Inicializar DataTables con los datos cargados
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,
      info: true,
      pageLength: 10,
      data: this.category, // Aquí los datos ya están disponibles
      columns: [
        { title: "ID", data: 'id', visible: false },
        { title: "Categoría", data: "description" },
        
        { 
          title: "Fecha", 
          data: "lastUpdatedDatetime", 
          render: function(data) {
            // Convertir de 'YYYY-MM-DD' a 'DD/MM/YYYY' para la visualización
            return moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          type: 'date-moment' // Usamos el tipo 'date-moment' para la ordenación correcta
        },
        {
          title: "Opciones",
          data: null,
          defaultContent: `
  <div class="dropdown">
    <button class="btn btn-ligth border border-black rounded-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" 
    width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" 
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#">Action</a></li>
      <li><a class="dropdown-item" href="#">Another action</a></li>
      <li><a class="dropdown-item" href="#">Something else here</a></li>
    </ul>
  </div>`
        }
      ],
      language: {
        processing: "Procesando...",
        search: "Buscar:",
        lengthMenu: "Mostrar MENU registros",
        info: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 registros",
        infoFiltered: "(filtrado de MAX registros totales)",
        loadingRecords: "Cargando...",
        zeroRecords: "No se encontraron resultados",
        emptyTable: "No hay datos disponibles en la tabla",
        paginate: {
          first: "Primero",
          previous: "Anterior",
          next: "Siguiente",
          last: "Último"
        }
      }
    });
    // Acción para el botón de acciones
   /* $('#myTable tbody').on('click', '.btn-secondary', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.showModalToNoteCredit();
    });
  }*/}


}
