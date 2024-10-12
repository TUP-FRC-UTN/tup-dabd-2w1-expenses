import { Component, OnInit } from '@angular/core';
import { Bill } from '../models/bill';
import { BillService } from '../services/bill.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

//Imports para el DataTable
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';

@Component({
  selector: 'app-view-gastos-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './view-gastos-admin.component.html',
  styleUrl: './view-gastos-admin.component.scss'
})
export class ViewGastosAdminComponent implements OnInit {
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
    //Inicializacion del Datatables
    $('#myTable').DataTable({
      "language" : {
        "url": "//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json"
      },
      paging : true,
      searching : true,
      ordering : true,
      pageLength : 10,

    });
  }



  // Filtrar por categoría o proveedor
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
