import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseReportService } from '../../../services/expenses-services/expenseReportServices/expense-report.service';
import { ExpenseData } from '../../../models/expenses-models/ExpenseData';
import { CategoryData } from '../../../models/expenses-models/CategoryData';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { ExpensesKpiComponent } from "../expenses-kpi/expenses-kpi.component";
import moment from 'moment';
import { kpiExpense } from '../../../models/expenses-models/kpiExpense';
import { LastBillRecord } from '../../../models/expenses-models/LastBillRecord';
import { debounceTime, distinctUntilChanged, finalize, mergeMap, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ExpenseCategoriesNgSelectComponent } from "../expenses-categories-ngSelect/expense-categories-ng-select/expense-categories-ng-select.component";
import { Category } from '../../../models/expenses-models/category';

@Component({
  standalone: true,
  selector: 'app-report-expense',
  imports: [CommonModule, FormsModule, ExpensesKpiComponent, ExpenseCategoriesNgSelectComponent,GoogleChartsModule],
  templateUrl: './expenses-report.component.html',
  styleUrls: ['./expenses-report.component.scss']
})
export class ReportExpenseComponent implements OnInit,OnDestroy {

  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  selectedCategories: Category[] = [];
  isLoading = false;
  dateFrom: string = '';
  dateTo: string = '';
  maxDateTo: string = '';
  expenseKpis : kpiExpense[] = []
  lastBillRecord : LastBillRecord | null = null;
  comparateYearMonth: ExpenseData[] = [];
  expenseKpiFiltered : kpiExpense[] = [];
  lastBillRecordFiltered : kpiExpense[] = [];
  comparateYearMonthFiltered: ExpenseData[] = [];
  
  
  amountCommon : number =0
  amountExtraordinary : number = 0
  amountIndividual : number = 0
  amountNoteCredit : number = 0

  lastBillCommon: number=0;
  lastBillExtraordinary : number = 0;
  lastBillIndividual : number = 0;
  lastBillNoteCredit: number = 0;

  constructor(private expenseReportService: ExpenseReportService,private cdRef: ChangeDetectorRef) {}

  chartExpensesPeriod = {
    type: 'PieChart' as ChartType,
    data: [] as [string,number][],
    options: {
      title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '90%', height: '90%' },
      //colors: ['#4CAF50', '#FF9800', '#03A9F4', '#f44336', '#9C27B0'],
    }
  };
  chartLastBill={
    type: 'PieChart' as ChartType,
    data: [] as [string,number][],
    options: {
      title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '90%', height: '90%' },
      //colors: ['#4CAF50', '#FF9800', '#03A9F4', '#f44336', '#9C27B0'],
    }
  }
  chartCompareYearMonth = {
    type: 'ColumnChart' as ChartType,
    columns: ['Meses'],
    data: [] as (string | number)[][],
    options: {
      
      hAxis: { 
        title: 'Meses',
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 1,
        textStyle: { fontSize: 12 } 
      },
      vAxis: { title: 'Monto ($)' },
      chartArea: { width: '85%', height: '70%' },
      legend: { position: 'bottom' },
      colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05'],
    }
  };

  ngOnInit() {
    console.log("ngOnInit called");
    this.loadDates();
    this.setupDateChangeObservable();
    this.initialKpis();
    this.initialLastBillRecord();
    this.initialcomparateYearMonth();
  }
  ngOnDestroy() {
    console.log("ngOnDestroy called");
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  loadDates() {
    const today = moment();
    this.dateTo = today.format('YYYY-MM-DD');
    this.maxDateTo = this.dateTo;
    this.dateFrom = today.subtract(1, 'month').format('YYYY-MM-DD');
  }
  private setupDateChangeObservable() {
    this.dateChangeSubject.pipe(
      debounceTime(3000),
      distinctUntilChanged((prev, curr) =>
        prev.from === curr.from && prev.to === curr.to
      ),
      tap(() => this.isLoading = true),
      switchMap(({ from, to }) =>
        this.expenseReportService.getKpiData(from, to).pipe(
          finalize(() => this.isLoading = false)
        )
      ),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (kpiExpenses: kpiExpense[]) => {
        this.expenseKpis = kpiExpenses;
        this.updateKpi();
      },
      error: (error) => {
        console.error('Error fetching bills:', error);
      }
    });
  }

  initialKpis() {
    this.expenseReportService.getKpiData(this.dateFrom,this.dateTo).pipe(take(1)).subscribe({
      next:(kpiExpenses: kpiExpense[])=>{
        this.expenseKpis = kpiExpenses;
       this.updateKpi();
      },
      error(error){
        console.log(error);
      }
    })
  }
  updateKpi(){
    this.expenseKpiFiltered = this.filterKpi(this.expenseKpis.slice());
    this.amountCommon= this.sumAmounts('COMUN',this.expenseKpiFiltered);
    this.amountExtraordinary= this.sumAmounts('EXTRAORDINARIO',this.expenseKpiFiltered);
    this.amountIndividual= this.sumAmounts('INDIVIDUAL',this.expenseKpiFiltered);
    this.amountNoteCredit= this.sumAmounts('NOTE_OF_CREDIT',this.expenseKpiFiltered);
    const aggregatedData = this.sumAmountByCategory(this.expenseKpiFiltered);
    this.chartExpensesPeriod.data = aggregatedData;
    this.cdRef.detectChanges();
  }

  filterKpi(list : kpiExpense[]) : kpiExpense[]{
    
    if (this.selectedCategories && this.selectedCategories.length>0){
      const selectedCategoryIds = this.selectedCategories.map(category => category.id as number); // Extraer los ids de las categorías seleccionadas
      return list.filter(expense => selectedCategoryIds.includes(expense.categoryId)); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }

  initialLastBillRecord(){
    this.expenseReportService.getLastBillRecord().pipe(take(1)).subscribe({
      next: (lastBillRecord: LastBillRecord)=>{
        this.lastBillRecord = lastBillRecord
        this.updateLastBillRecord();
        console.log(lastBillRecord)
      },
      error(error){
        console.log(error);
      }
    })
  }
  updateLastBillRecord(){
    if(this.lastBillRecord){
      this.lastBillRecordFiltered = this.filterKpi(this.lastBillRecord.bills)
      this.lastBillCommon= this.sumAmounts('COMUN',this.lastBillRecordFiltered);
      this.lastBillExtraordinary= this.sumAmounts('EXTRAORDINARIO',this.lastBillRecordFiltered);
      this.lastBillIndividual= this.sumAmounts('INDIVIDUAL',this.lastBillRecordFiltered);
      this.lastBillNoteCredit= this.sumAmounts('NOTE_OF_CREDIT',this.lastBillRecordFiltered);
      const aggregatedData = this.sumAmountByCategory(this.lastBillRecordFiltered);
    this.chartLastBill.data = aggregatedData;
    this.cdRef.detectChanges();
    }
    
  }

  initialcomparateYearMonth() {
    this.expenseReportService.getExpenseData().pipe(take(1)).subscribe({
      next: (expenseData: ExpenseData[]) => {
        this.comparateYearMonth = expenseData;
        this.updatecomparateYearMonth();
      },
      error(error) {
        console.log(error);
      }
    });
  }
  updatecomparateYearMonth() {
    this.comparateYearMonthFiltered = this.filercomparateYearMonth(this.comparateYearMonth.slice());
    const data = this.sumAmountByYearMonth(this.comparateYearMonthFiltered);
    this.chartCompareYearMonth.data = data;
    this.cdRef.detectChanges();
  }
  
  filercomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(category => category.id as number);
      return list.filter(expense => selectedCategoryIds.includes(expense.categoryId));
    }
    return list;
  }

  sumAmounts(expenseType : string, list :any[]): number{
   const amountCommon =list
    .filter(m=>m.expenseType==expenseType)
    .reduce((sum,current)=>sum+current.amount,0)
    return amountCommon
  }
  sumAmountByCategory(list: kpiExpense[]): any{
    const aggregatedData = list.reduce((acc: [string, number][], exp) => {
      const category = exp.description || "Sin Categoría"; // Asignar un valor por defecto en caso de que `description` esté indefinido
      const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount as string); // Convertir `amount` si es necesario
    
      const existing = acc.find(item => item[0] === category);
      if (existing) {
        existing[1] += amount;
      } else {
        acc.push([category, amount]);
      }
      return acc;
    }, []);
    return aggregatedData;
  }
  sumAmountByYearMonth(list: ExpenseData[]): any {
    const years = Array.from(new Set(list.map(d => d.year))).sort();

    // Define las columnas para el gráfico, donde el primer elemento es 'Meses' seguido de los años
    this.chartCompareYearMonth.columns = ['Meses', ...years.map(year => year.toString())];

    // Creamos un objeto para almacenar la suma acumulada de cada mes y año
    const aggregatedData = list.reduce((acc, d) => {
        const key = `${d.year}-${d.month}`; // Llave única para año y mes
        if (!acc[key]) {
            acc[key] = 0;
        }
        acc[key] += d.amount; // Acumula el monto para el año y mes específicos
        return acc;
    }, {} as Record<string, number>);

    // Generamos el arreglo para los meses, inicializando cada fila con el nombre del mes y un valor de 0 para cada año
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = months.map(month => {
        const monthName = new Date(0, month - 1).toLocaleString('es', { month: 'long' });
        const row = [monthName, ...years.map(year => {
            const key = `${year}-${month}`;
            return aggregatedData[key] || 0; // Asigna el valor acumulado o 0 si no hay datos para ese mes y año
        })];
        return row;
    });

    return monthlyData;
  }

  onSelectedCategoriesChange(): void {
    this.updateKpi();
    this.updateLastBillRecord();
    this.updatecomparateYearMonth();
  }

  filterDataOnChange(){
    this.dateChangeSubject.next({ from: this.dateFrom, to: this.dateTo });
  }
  // Obtener nombre del mes
  getMonthName(month: number): string {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('default', { month: 'long' });
  }
  clearFiltered(){
    
  }
}
