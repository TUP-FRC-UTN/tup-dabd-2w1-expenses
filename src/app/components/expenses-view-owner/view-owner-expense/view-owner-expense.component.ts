import { Component, OnInit } from '@angular/core';
import 'datatables.net';
import 'datatables.net-bs5';
import moment from 'moment';
import $ from 'jquery';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BillViewOwner } from '../../../models/viewOwnerModel/bill-view-owner.model';
import { BillViewOwnerService } from '../../../services/viewOwnerServices/bill-view-owner.service';
import { ProviderViewOwnerService } from '../../../services/viewOwnerServices/provider-view-owner.service';

@Component({
  selector: 'app-view-owner-expense',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './view-owner-expense.component.html',
  styleUrls: ['./view-owner-expense.component.scss'],
})

export class ViewOwnerExpenseComponent implements OnInit {
  bills: BillViewOwner[] = [];
  filteredBills: BillViewOwner[] = [];
  providersMap: { [key: string]: string } = {};
  dataTable: any;
  fechaDesde: string = '';
  fechaHasta: string = '';
  maxDateTo: string = '';

  constructor(
    private billService: BillViewOwnerService, 
    private providerService: ProviderViewOwnerService
  ) {}

  ngOnInit(): void {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = function (d: string) {
      return moment(d, 'DD/MM/YYYY').unix();  // Convertir la fecha a timestamp para que pueda ordenarse
    };
    //this.loadData();
    this.loadDates();
    this.filtrarPorFecha();
    //this.initDataTable(this.bills);
  }

  // loadData(): void {
  //   this.providerService.getProviders().subscribe(providers => {
  //     this.providersMap = providers.reduce((acc: { [key: string]: string }, provider) => {
  //       acc[provider.id] = provider.nombre;
  //       return acc;
  //     }, {});

  //     this.billService.getBillsOnInit().subscribe((data: BillViewOwner[]) => {
  //       console.log('Datos de facturas recibidos:', data);
  //       this.bills = data.map(bill => ({
  //         ...bill,
  //         providerId: this.providersMap[bill.providerId] || 'Desconocido'
  //       }));
  //       this.filteredBills = [...this.bills];
  //       setTimeout(() => {
  //         this.initDataTable(this.filteredBills);
  //       }, 0);
  //     });
  //   });
  // }

  loadDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.fechaHasta = `${yyyy}-${mm}-${dd}`;
    this.maxDateTo=`${yyyy}-${mm}-${dd}`;
    const past = new Date();
    past.setMonth(past.getMonth() - 1); 
    const pastyyyy = past.getFullYear();
    const pastmm = String(past.getMonth() + 1).padStart(2, '0');
    const pastdd = String(past.getDate()).padStart(2, '0');
    this.fechaDesde = `${pastyyyy}-${pastmm}-${pastdd}`;
  }

  // getBillsByOwnerId(ownerId: number): void {
  //   this.billService.getBillsByOwnerIdAndDateFromDateTo(ownerId,this.fechaDesde,this.fechaHasta).subscribe((data: BillViewOwner[]) => {
  //     console.log('Datos de facturas recibidos:', data);
  //     this.bills = data.map(bill => ({
  //       ...bill,
  //       providerId: this.providersMap[bill.providerId] || 'Desconocido'
  //     }));
  //     this.filteredBills = [...this.bills];
  //     setTimeout(() => {
  //       this.initDataTable(this.filteredBills);
  //     }, 0);
  //   });
  // }


  filtrarPorFecha(): void {
    const formattedDateFrom = this.fechaDesde;
    const formattedDateTo = this.fechaHasta;

    this.billService.getBillsByOwnerIdAndDateFromDateTo(223,formattedDateFrom, formattedDateTo).subscribe(
      (filteredBills) => {
        this.bills = filteredBills; 
        this.configDataTable();
        console.log(filteredBills);
      },
      (error) => {
        console.error('Error al filtrar los gastos:', error);
      }
    );
  }
  // loadBillsFiltered() {
  //   const dataTable = $('#myTable').DataTable();
  //   dataTable.clear();
  //   dataTable.rows.add(this.bills);
  //   dataTable.draw();
  // }
  // formatDate(date: string) {
  //   const parsedDate = new Date(date);
  //   const year = parsedDate.getFullYear();
  //   const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0')
  //   const day = parsedDate.getDate().toString().padStart(2, '0'); 
  //   return `${year}-${month}-${day}`;
  // }

  // initDataTable(data: BillViewOwner[]): void {
  //   const table = $('#myTable');

  //   if (($.fn as any).DataTable.isDataTable('#myTable')) {
  //     $('#myTable').DataTable().clear().destroy();
  //   }

  //   this.dataTable = table.DataTable({
  //     paging: true,
  //     searching: true,
  //     ordering: true,
  //     lengthChange: false,
  //     info: true,
  //     pageLength: 10,
  //     data: data,
  //     columns: [
  //       { data: 'description', title: 'Descripción' },
  //       { data: 'category.description', title: 'Categoría' },
  //       { data: 'providerId', title: 'Proveedor' },
  //       { data: 'expenseType', title: 'Tipo de Gasto' },
  //       {
  //         data: 'expenseDate',
  //         title: 'Fecha',
  //         render: function(data) {
  //           if (Array.isArray(data) && data.length === 3) {
  //             const date = new Date(data[0], data[1] - 1, data[2]);
  //             const day = date.getDate().toString().padStart(2, '0');
  //             const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //             const year = date.getFullYear();
  //             return `${day}/${month}/${year}`;
  //           }
  //           return data;  //Funcion utilizada para formatear fecha a dd/mm/yyyy
  //         }
  //       },
  //       {
  //         data: 'amount',
  //         title: 'Monto',
  //         render: (data) => `$${data}`,
  //       },
  //     ],
  //     language: {
  //       processing: 'Procesando...',
  //       search: 'Buscar:',
  //       lengthMenu: 'Mostrar _MENU_ registros',
  //       info: 'Mostrando del _START_ al _END_ de _TOTAL_ registros',
  //       infoEmpty: 'Mostrando 0 registros',
  //       infoFiltered: '(filtrado de _MAX_ registros totales)',
  //       loadingRecords: 'Cargando...',
  //       zeroRecords: 'No se encontraron resultados',
  //       emptyTable: 'No hay datos disponibles en la tabla',
  //       paginate: {
  //         first: 'Primero',
  //         previous: 'Anterior',
  //         next: 'Siguiente',
  //         last: 'Último',
  //       },
  //       aria: {
  //         sortAscending: ': activar para ordenar la columna de manera ascendente',
  //         sortDescending: ': activar para ordenar la columna de manera descendente',
  //       },
  //     },
  //   });
  // }
  configDataTable(){
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
      data: this.bills,
      columns: [
        { data: 'category.description', title: 'Categoría' },
        { data: 'providerId', title: 'Proveedor',render: function(data){
          return "empresa anonima"
        } },
        { data: 'expenseType', title: 'Tipo de Gasto',render: function(data) {
          return data === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : data;
        } },
        { data: 'description', title: 'Descripción' },
        
        {
          data: 'amount',
          title: 'Monto',
          render: (data) => `$${data}`,
        },
        
        { 
          title: "Fecha", 
          data: "expenseDate", 
          render: function(data) {
            // Convertir de 'YYYY-MM-DD' a 'DD/MM/YYYY' para la visualización
            return moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          type: 'date-moment' // Usamos el tipo 'date-moment' para la ordenación correcta
        },
        
      ],
      language: {
        processing: 'Procesando...',
        search: 'Buscar:',
        lengthMenu: 'Mostrar _MENU_ registros',
        info: 'Mostrando del _START_ al _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros totales)',
        loadingRecords: 'Cargando...',
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles en la tabla',
        paginate: {
          first: 'Primero',
          previous: 'Anterior',
          next: 'Siguiente',
          last: 'Último',
        },
        aria: {
          sortAscending: ': activar para ordenar la columna de manera ascendente',
          sortDescending: ': activar para ordenar la columna de manera descendente',
        },
      }
    });
  }
}
