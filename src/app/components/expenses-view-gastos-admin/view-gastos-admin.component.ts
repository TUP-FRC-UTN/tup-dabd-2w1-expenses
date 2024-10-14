import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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


@Component({
  selector: 'app-view-gastos-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  providers: [BillService],
  templateUrl: './view-gastos-admin.component.html',
  styleUrl: './view-gastos-admin.component.scss'
})
export class ViewGastosAdminComponent implements OnInit {

  dateFrom: string = ''; 
  dateTo: string = '';
  maxDateTo: string = '';
  distributionList : DistributionList[] = [];
  installmentList : Instalmentlist[] = [];
  failedBillId: number =0;
  showErrorModal = false;
 @ViewChild('errorModal') errorModal: ElementRef | undefined;
  constructor(private cdRef: ChangeDetectorRef) {}
  private readonly billService = inject(BillService)

  bills: Bill[] = [];
  filterBills: Bill[] = [];
  categories: string[] = [];
  providers: string[] = [];
  expenseTypes: string[] = [];


  filters ={
    categoryOrProviderOrExpenseType: '',
    expenseTypes: '',
  }
  
  ngOnInit(): void {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = function (d: string) {
      return moment(d, 'DD/MM/YYYY').unix();  // Convertir la fecha a timestamp para que pueda ordenarse
    };

   this.loadDates()
   this.configDataTable();
    this.filterData();
  }
  loadDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.dateTo = `${yyyy}-${mm}-${dd}`;
    this.maxDateTo=`${yyyy}-${mm}-${dd}`;
    const past = new Date();
    past.setMonth(past.getMonth() - 1); 
    const pastyyyy = past.getFullYear();
    const pastmm = String(past.getMonth() + 1).padStart(2, '0');
    const pastdd = String(past.getDate()).padStart(2, '0');
    this.dateFrom = `${pastyyyy}-${pastmm}-${pastdd}`;
  }
  deleteBill(id: any) {
    this.billService.deleteLogicBill(id)
      .subscribe(
        () => {
          console.log(`Gasto con ID ${id} eliminada con éxito.`);
          alert('Se elimino con exito el gasto')
          this.filterData();
        },
        (error) => {
          console.error(`Error al eliminar la factura con ID ${id}:`, error);
          if(error.error.status==409 && error.error.message=="Expense has related bill installments"){
            this.showModalToNoteCredit();
            this.failedBillId=id
          }
          else{
            alert('Se elimino con exito el gasto')
          }

          
        }
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
      const formattedDateFrom = this.dateFrom;
      const formattedDateTo = this.dateTo;
      debugger
      this.billService.getBillsByDateRange(formattedDateFrom, formattedDateTo).subscribe(
        (filteredBills) => {
          this.bills = filteredBills; 
          this.configDataTable();
        },
        (error) => {
          console.error('Error al filtrar los gastos:', error);
        }
      );
  }
  loadBillsFiltered() {
    const dataTable = $('#myTable').DataTable();
    dataTable.clear();
    dataTable.rows.add(this.bills);
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
    this.loadBillsFiltered();
  }
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
  }
  configDataTable(){
    // Verifica si la tabla ya está inicializada, si es así, destrúyela antes de reinicializar
    
    if ($.fn.DataTable.isDataTable('#myTable')) {
      let table = $('#myTable').DataTable();
      table.clear();
      table.rows.add(this.bills);
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
      data: this.bills, // Aquí los datos ya están disponibles
      columns: [
        { title: "ID", data: 'id', visible: false },
        { title: "Categoría", data: "category" },
        { title: "Proveedor", data: "provider" },
        
        { title: "Tipo de Gasto", data: "expenseType",render: function(data) {
          return data === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : data;
        } },
        { title: "Monto", data: "amount",render: (data) => `$${data}` },
        { 
          title: "Fecha", 
          data: "expenseDate", 
          render: function(data) {
            // Convertir de 'YYYY-MM-DD' a 'DD/MM/YYYY' para la visualización
            return moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          type: 'date-moment' // Usamos el tipo 'date-moment' para la ordenación correcta
        },
        {
          title: "Opciones",
          data: null,
          defaultContent: '<button class="btn btn-danger">Eliminar</button>'
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
    // Acción para el botón de eliminar
    $('#myTable tbody').on('click', '.btn-danger', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.deleteBill(rowData.id);
    });
  }


  /*applyFilters(): void {
    let filtered = this.bills;

  if (this.filters.categoryOrProviderOrExpenseType) {
    if (this.categories.includes(this.filters.categoryOrProviderOrExpenseType)) {
      filtered = filtered.filter(bill => bill.category.includes(this.filters.categoryOrProviderOrExpenseType));
    } else if (this.providers.includes(this.filters.categoryOrProviderOrExpenseType)) {
      filtered = filtered.filter(bill => bill.provider.includes(this.filters.categoryOrProviderOrExpenseType));
    } else if (this.expenseTypes.includes(this.filters.categoryOrProviderOrExpenseType)) {
      filtered = filtered.filter(bill => bill.expenseType.includes(this.filters.categoryOrProviderOrExpenseType));
    }
  }

  this.filterBills = filtered;
}*/

}
