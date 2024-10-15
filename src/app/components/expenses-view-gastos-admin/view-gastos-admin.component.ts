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
import { debounceTime, distinctUntilChanged, filter, mergeMap, of, Subject, switchMap, takeUntil, tap } from 'rxjs';


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
  distributionList: DistributionList[] = [];
  installmentList: Instalmentlist[] = [];
  failedBillId: number = 0;
  showErrorModal = false;
  isInitial: Boolean = true;
  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  @ViewChild('errorModal') errorModal: ElementRef | undefined;

  bills: Bill[] = [];
  filterBills: Bill[] = [];
  categories: string[] = [];
  providers: string[] = [];
  expenseTypes: string[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private billService: BillService
  ) {}

  ngOnInit(): void {
    this.loadDates();
    this.setupDateChangeObservable();
    this.configDataTable();
    this.filterDataOnInit();
  }
  filterDataOnInit() {
    this.billService.getBillsByDateRange(this.dateFrom, this.dateTo).subscribe({
      next: (response: Bill[]) => {
        this.bills = response;
        this.loadBillsFiltered();
      },
      error: (error) => {
        console.error('Error fetching initial bills:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupDateChangeObservable() {
    this.dateChangeSubject.pipe(
      debounceTime(3000),
      distinctUntilChanged((prev, curr) => 
        prev.from === curr.from && prev.to === curr.to
      ),
      switchMap(({ from, to }) => this.billService.getBillsByDateRange(from, to)),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (response: Bill[]) => {
        this.bills = response;
        this.loadBillsFiltered();
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
      }
    });
  }

  filterDataOnChange() {
    this.dateChangeSubject.next({ from: this.dateFrom, to: this.dateTo });
  }

  loadDates() {
    const today = moment();
    this.dateTo = today.format('YYYY-MM-DD');
    this.maxDateTo = this.dateTo;
    this.dateFrom = today.subtract(1, 'month').format('YYYY-MM-DD');
  }

  deleteBill(id: number) {
    this.billService.deleteLogicBill(id).subscribe({
      next: () => {
        console.log(`Gasto con ID ${id} eliminada con éxito.`);
        alert('Se eliminó con éxito el gasto');
        this.filterDataOnChange();
      },
      error: (error) => {
        console.error(`Error al eliminar la factura con ID ${id}:`, error);
        if (error.error.status == 409 && error.error.message == "Expense has related bill installments") {
          this.showModalToNoteCredit();
          this.failedBillId = id;
        } else {
          alert('Ocurrió un error al eliminar el gasto');
        }
      }
    });
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

  loadBillsFiltered() {
    const dataTable = $('#myTable').DataTable();
    dataTable.clear().rows.add(this.bills).draw();
  }

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
    this.billService.createNoteOfCredit(this.failedBillId).subscribe({
      next: () => {
        console.log(`Gasto con ID ${this.failedBillId} se le creó nota de crédito con éxito`);
        this.filterDataOnChange();
        alert('Se realizó la nota de crédito con éxito');
        this.closeModal();
      },
      error: (error) => {
        console.error(`Error al realizar la nota de crédito del gasto con ID ${this.failedBillId}:`, error);
        alert('No se pudo realizar la nota de crédito con éxito');
        this.showModalToNoteCredit();
      }
    });
  }

  configDataTable() {
    $.fn.dataTable.ext.type.order['date-moment-pre'] = (d: string) => moment(d, 'DD/MM/YYYY').unix();

    if ($.fn.DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().destroy();
    }

    $('#myTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: false,
      info: true,
      pageLength: 10,
      data: this.bills,
      columns: [
        { title: "ID", data: 'id', visible: false },
        { 
          title: "Tipo de Gasto", 
          data: "expenseType",
          render: (data) => data === 'NOTE_OF_CREDIT' ? 'NOTA DE CRÉDITO' : data
        },
        { title: "Categoría", data: "category" },
        { title: "Proveedor", data: "provider" },
        { 
          title: "Fecha", 
          data: "expenseDate", 
          render: (data) => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          type: 'date-moment'
        },
        { 
          title: "Monto", 
          data: "amount",
          render: (data) => `$${data}`
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

    $('#myTable tbody').on('click', '.btn-danger', (event) => {
      const row = $(event.currentTarget).closest('tr');
      const rowData = $('#myTable').DataTable().row(row).data();
      this.deleteBill(rowData.id);
    });
  }
}
 


