import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild  } from '@angular/core';

import { Bill } from '../../models/bill';
import { FormsModule, NgForm } from '@angular/forms';

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
import { Category } from '../../models/category';

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

  category: Category[] = [];
  filterCategory: Category[] = [];
  expenseCategory: Category =new Category();


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
        { title: "Estado", data: "state" },
        
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
       <li><button class="dropdown-item edit" >Editar</button></li>
      <li><button class="dropdown-item delete" >Eliminar</button></li>
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
      },
      layout: {
        topStart: 'search',
        topEnd: 'pageLength'
      }
  
    })
    // Acción para el botón de acciones
    $('#myTable tbody').on('click', '.add', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.showModalToAddCategory();
    });

    $('#myTable tbody').on('click', '.edit', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.showModalToAddCategory();
    });
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
    this.categoryService.add(this.expenseCategory).subscribe({
      next: () => {
        console.log(`Categoria agregada con éxito.`);
        alert('Se agrego con éxito el gasto');
      },
      error: (error) => {
        console.error(`Error al agregar:`, error);
     //   if (error.error.status == 409 && error.error.message == "Expense has related bill installments") {
        //  this.openModal(this.modalNoteCredit)} 
        //else {
          //alert('Ocurrió un error al eliminar el gasto');
        //}
      }
    })
    console.log(this.expenseCategory)
    form.reset();
    this.closeModal();
  }

  delete(id:number){
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        console.log(`Categoria eliminada con éxito.`);
        alert('Se eliminó con éxito la categoria');
      },
      error: (error) => {
        console.error(`Error al eliminar la categoria `, error);
        
          alert('Ocurrió un error al eliminar el gasto');
        
        }
      }
    );
  }

  showModalToAddCategory() {
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

  showModalToEditCategory(description:string) {
    this.showErrorModal = true;
    this.cdRef.detectChanges();
    setTimeout(() => {
      const modalElement = document.getElementById('errorModal');
      this.expenseCategory.description=description;
      if (modalElement) {
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
      }
    }, 0);
  }



}
