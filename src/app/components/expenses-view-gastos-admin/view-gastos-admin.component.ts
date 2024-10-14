import { Component, inject, OnInit } from '@angular/core';
import { Bill } from '../../models/bill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//Imports para el DataTable
import  moment from 'moment'
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
  distributionList : DistributionList[] = [];
  installmentList : Instalmentlist[] = [];
  failedBillId: number =0;
  showErrorModal = false;

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
    // Definir el tipo de ordenación 'date-moment' para las fechas
    ($.fn.dataTable as any).moment = function (format: string) {
      $.fn.dataTable.ext.type.order['date-moment-pre'] = function (data: any) {
        return moment(data, format).unix(); // Convertir la fecha a timestamp para una correcta ordenación
      };
    };
  
    // Aplica Moment.js al formato 'YYYY-MM-DD'
    ($.fn.dataTable as any).moment('YYYY-MM-DD');
   this.loadBills()
   this.loadDates()
  
    // Inicializar DataTable
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,
      info: true,
      pageLength: 10,
      data: this.bills, // DataSource de la API
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
      columns: [
        { title: "ID", data: 'id', visible: false },
        { title: "Categoría", data: "category" },
        { title: "Proveedor", data: "provider" },
        { title: "Monto", data: "amount" },
        { title: "Tipo de Gasto", data: "expenseType" },
        { 
          title: "Fecha", 
          data: "expenseDate", 
          render: function(data) {
            // Usar Moment.js para formatear las fechas desde 'YYYY-MM-DD' a 'DD/MM/YYYY'
            return moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          type: 'date-moment' // Tipo de columna para fechas, utilizando Moment.js
        },
        {
          title: "Opciones",
          data: null,
          defaultContent: '<button class="btn btn-danger">Eliminar</button>'
        }
      ]
    });
  
    // Acción para el botón de eliminar
    $('#myTable tbody').on('click', '.btn-danger', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.deleteBill(rowData.id);
    });
  }
  loadDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.dateTo = `${yyyy}-${mm}-${dd}`;
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
          this.loadBills();
        },
        (error) => {
          console.error(`Error al eliminar la factura con ID ${id}:`, error);
          debugger
          this.showModalToNoteCredit();
          this.failedBillId=id
        }
      );
  }
  showModalToNoteCredit() {
    this.showErrorModal = true;
    setTimeout(() => {
      const modalElement = document.getElementById('errorModal');
      if (modalElement) {
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
      }
    }, 0);
  }
  filterData() {
      const formattedDateFrom = this.formatDate(this.dateFrom);
      const formattedDateTo = this.formatDate(this.dateTo);

      this.billService.getBillsByDateRange(formattedDateFrom, formattedDateTo).subscribe(
        (filteredBills) => {
          this.bills = filteredBills; 
          this.loadBillsFiltered();
          console.log(filteredBills);
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
  formatDate(date: string) {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0')
  const day = parsedDate.getDate().toString().padStart(2, '0'); 
  return `${year}-${month}-${day}`;
  }

  closeModal() {
    this.showErrorModal = false;
    const modalElement = document.getElementById('errorModal');
    this.loadBillsFiltered()
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
    }
  }
  deleteWithNoteCredit() {
    this.billService.createNoteOfCredit(this.failedBillId)
      .subscribe(
        () => {
          console.log(`Gasto con ID ${this.failedBillId} se le creo nota de credito con exito`);
          this.loadBills();
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
  loadBills() {
    this.billService.getBillsOnInit().subscribe({
      next: (data: Bill[]) => {
        console.log('Bills received:', data);
        this.bills = data;
        const dataTable = $('#myTable').DataTable();
        dataTable.clear();
        dataTable.rows.add(this.bills);
        dataTable.draw();
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
      },
      complete: () => {
        console.log('Request completed');
      }
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
