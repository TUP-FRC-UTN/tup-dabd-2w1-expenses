import { Component, OnInit } from '@angular/core';
import 'datatables.net';
import 'datatables.net-bs5';
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

  constructor(
    private billService: BillViewOwnerService, 
    private providerService: ProviderViewOwnerService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initDataTable(this.bills);
  }

  loadData(): void {
    this.providerService.getProviders().subscribe(providers => {
      this.providersMap = providers.reduce((acc: { [key: string]: string }, provider) => {
        acc[provider.id] = provider.nombre;
        return acc;
      }, {});

      this.getBillsByOwnerId(223);
    });
  }

  getBillsByOwnerId(ownerId: number): void {
    this.billService.getBillsByOwnerId(ownerId).subscribe((data: BillViewOwner[]) => {
      console.log('Datos de facturas recibidos:', data);
      this.bills = data.map(bill => ({
        ...bill,
        providerId: this.providersMap[bill.providerId] || 'Desconocido'
      }));

      this.filteredBills = [...this.bills];

      setTimeout(() => {
        this.initDataTable(this.filteredBills);
      }, 0);
    });
  }


  filtrarPorFecha(): void {
    const desde = new Date(this.fechaDesde);
    const hasta = new Date(this.fechaHasta);

    this.filteredBills = this.bills.filter(bill => {
      const expenseDate = new Date(bill.expenseDate[0], bill.expenseDate[1] - 1, bill.expenseDate[2]);
      return (!this.fechaDesde || expenseDate >= desde) && (!this.fechaHasta || expenseDate <= hasta);
    });

    setTimeout(() => {
      this.initDataTable(this.filteredBills);
    }, 0);
  }

  initDataTable(data: BillViewOwner[]): void {
    const table = $('#myTable');

    if (($.fn as any).DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().clear().destroy();
    }

    this.dataTable = table.DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,
      info: true,
      pageLength: 10,
      data: data,
      columns: [
        { data: 'description', title: 'Descripción' },
        { data: 'categoryDescription', title: 'Categoría' },
        { data: 'providerId', title: 'Proveedor' },
        { data: 'expenseType', title: 'Tipo de Gasto' },
        {
          data: 'expenseDate',
          title: 'Fecha',
          render: (data) => new Date(data[0], data[1] - 1, data[2]).toLocaleDateString(),
        },
        {
          data: 'amount',
          title: 'Monto',
          render: (data) => `$${data}`,
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
      },
    });
  }
}
