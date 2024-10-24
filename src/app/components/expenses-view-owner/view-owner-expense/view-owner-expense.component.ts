import { Component, OnInit, OnDestroy } from '@angular/core';
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
import * as XLSX from 'xlsx';   // Para exportar a Excel
import jsPDF from 'jspdf';      // Para exportar a PDF
import 'jspdf-autotable';       // Para generar tablas en PDF
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-owner-expense',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './view-owner-expense.component.html',
  styleUrls: ['./view-owner-expense.component.scss'],
})
export class ViewOwnerExpenseComponent implements OnInit, OnDestroy {
  bills: BillViewOwner[] = [];
  filteredBills: BillViewOwner[] = [];
  providersMap: { [key: string]: string } = {};
  dataTable: any;
  fechaDesde: string = '';
  fechaHasta: string = '';
  maxDateTo: string = '';

  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  isLoading = false;

  constructor(
    private billService: BillViewOwnerService,
    private providerService: ProviderViewOwnerService
  ) { }

  ngOnInit(): void {
    this.loadDates();
    this.setupDateChangeObservable();
  
    this.filterDataOnChange();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Configuración del observable para escuchar cambios en las fechas
  private setupDateChangeObservable() {
    this.dateChangeSubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      debounceTime(1200),
      distinctUntilChanged((prev, curr) => 
        prev.from === curr.from && prev.to === curr.to
      ),
      switchMap(({ from, to }) => {
        return this.billService.getBillsByOwnerIdAndDateFromDateTo(223, from, to);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response: BillViewOwner[]) => {
        this.bills = response;
        this.configDataTable();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
        this.isLoading = false;
      }
    });
  }

  // Cargar fechas por defecto (último mes hasta hoy)
  loadDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.fechaHasta = `${yyyy}-${mm}-${dd}`;
    this.maxDateTo = `${yyyy}-${mm}-${dd}`;
  
    const past = new Date();
    past.setMonth(past.getMonth() - 1);
    const pastyyyy = past.getFullYear();
    const pastmm = String(past.getMonth() + 1).padStart(2, '0');
    const pastdd = String(past.getDate()).padStart(2, '0');
    this.fechaDesde = `${pastyyyy}-${pastmm}-${pastdd}`;
  
    // Realizar la búsqueda automáticamente después de cargar las fechas por defecto
    this.filterDataOnChange();
  }

  // Cuando cambia alguna de las fechas
  filterDataOnChange() {
    this.dateChangeSubject.next({ from: this.fechaDesde, to: this.fechaHasta });
  }

  // Exportar a PDF
  exportToPDF(): void {
    const doc = new jsPDF();
  
    const pageTitle = 'Listado de Gastos';
    doc.setFontSize(18);
    doc.text(pageTitle, 15, 10);
    doc.setFontSize(12);
  
    doc.text(`Fechas: Desde ${moment(this.fechaDesde).format('DD/MM/YYYY')} hasta ${moment(this.fechaHasta).format('DD/MM/YYYY')}`, 15, 20);
  
    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();
  
    const pdfData = filteredData.map(bill => {
      const [category, ...rest] = bill.description.split(' - ');
      return [
        rest.join(' - '),
        category,
        bill.providerId,
        bill.expenseType,
        moment(bill.expenseDate).format('DD/MM/YYYY'),
        `$${bill.amount}`
      ];
    });
  
    let pageCount = 0;
  
    (doc as any).autoTable({
      head: [['Descripción', 'Categoría', 'Proveedor', 'Tipo de Gasto', 'Fecha', 'Monto']],
      body: pdfData,
      startY: 30, 
      theme: 'grid',
      margin: { top: 30, bottom: 20 },
      didDrawPage: function (data: any) {
        pageCount++;
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
  
        doc.setFontSize(10);
        const text = `Página ${pageCount}`;
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageSize.width / 2) - (textWidth / 2), pageHeight - 10);
      }
    });
  
    doc.save('listado_gastos.pdf');
  }
  
  //Exportar a Excel
  exportToExcel(): void {
    const table = $('#myTable').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();
  
    const encabezado = [
      [`Listado de Gastos`],
      [`Fechas: Desde ${moment(this.fechaDesde).format('DD/MM/YYYY')} hasta ${moment(this.fechaHasta).format('DD/MM/YYYY')}`],
      [],
      ['Descripción', 'Categoría', 'Proveedor', 'Tipo de Gasto', 'Fecha', 'Monto']
    ];
  
    const excelData = filteredData.map(bill => {
      const [category, ...rest] = bill.description.split(' - ');
      return [
        rest.join(' - '),
        category,
        bill.providerId,
        bill.expenseType === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : bill.expenseType,
        moment(bill.expenseDate).format('DD/MM/YYYY'),
        `$${bill.amount}`
      ];
    });
  
    const worksheetData = [...encabezado, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 30 },  // Ancho de la columna de descripción
      { wch: 20 },  // Ancho de la columna de categoría
      { wch: 20 },  // Ancho de la columna de proveedor
      { wch: 20 },  // Ancho de la columna de tipo de gasto
      { wch: 15 },  // Ancho de la columna de fecha
      { wch: 10 }   // Ancho de la columna de monto
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');
  
    XLSX.writeFile(workbook, `listado_gastos_${moment(this.fechaDesde).format('YYYYMMDD')}_${moment(this.fechaHasta).format('YYYYMMDD')}.xlsx`);
  }
  

  // Actualizar la tabla DataTable con los nuevos datos
  configDataTable() {
    console.log(this.bills);
    if ($.fn.DataTable.isDataTable('#myTable')) {
      const table = $('#myTable').DataTable();
      table.clear();
      table.rows.add(this.bills);
      table.draw();
      return;
    }
  
    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,
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
            return moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          type: 'date-moment'
        },
        
      ],
      language: {
        search: 'Buscar:',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        },
        zeroRecords: 'No se encontraron resultados',
        emptyTable: 'No hay datos disponibles'
      }
    });
  } 
}