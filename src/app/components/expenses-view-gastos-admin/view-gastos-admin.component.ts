import { Component, inject, OnInit } from '@angular/core';
import { Bill } from '../../models/bill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

//Imports para el DataTable
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { DistributionList } from '../../models/distributionList';
import { Instalmentlist } from '../../models/installmentList';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-view-gastos-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  providers: [BillService],
  templateUrl: './view-gastos-admin.component.html',
  styleUrl: './view-gastos-admin.component.scss'
})
export class ViewGastosAdminComponent implements OnInit {
  
  distributionList : DistributionList[] = [];
  installmentList : Instalmentlist[] = [];

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
    this.loadBills()
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,  
      info: true,          
      pageLength: 10,
      data: this.bills,
      language: {
        processing: "Procesando...",
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        infoPostFix: "",
        loadingRecords: "Cargando...",
        zeroRecords: "No se encontraron resultados",
        emptyTable: "No hay datos disponibles en la tabla",
        paginate: {
          first: "Primero",
          previous: "Anterior",
          next: "Siguiente",
          last: "Último"
        },
        aria: {
          sortAscending: ": activar para ordenar la columna de manera ascendente",
          sortDescending: ": activar para ordenar la columna de manera descendente"
        }
      },
      columns: [
        { title: "ID", data: 'id', visible: false },
        { title: "Categoría", data: "category" },
        { title: "Proveedor", data: "provider" },
        { title: "Monto", data: "amount" },
        { title: "Tipo de Gasto", data: "expenseType" },
        { title: "Fecha", data: "expenseDate"},
        {
          title: "Opciones",
          data: null,
          defaultContent: '<button class="btn btn-primary">Eliminar</button>'
        }
      ]
    });
    
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


  applyFilters(): void {
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
}

}
