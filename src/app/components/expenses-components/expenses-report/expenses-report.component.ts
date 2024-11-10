import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
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
import { ExpensesFiltersComponent } from "../expenses-filters/expenses-filters.component";
import { Provider } from '../../../models/expenses-models/provider';
import { ExpenseType } from '../../../models/expenses-models/expenseType';

@Component({
  standalone: true,
  selector: 'app-report-expense',
  imports: [CommonModule, FormsModule, ExpensesKpiComponent, ExpenseCategoriesNgSelectComponent, GoogleChartsModule, ExpensesFiltersComponent,NgIf],
  templateUrl: './expenses-report.component.html',
  styleUrls: ['./expenses-report.component.scss']
})
export class ReportExpenseComponent implements OnInit,OnDestroy {

  private dateChangeSubject = new Subject<{ from: string, to: string }>();
  private unsubscribe$ = new Subject<void>();
  selectedCategories: Category[] = [];
  selectedProviders: Provider[] =[];
  selectedType: ExpenseType[]=[];
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
  cardView:Number = 0;
  
  
  amountCommon : number =0
  amountExtraordinary : number = 0
  amountIndividual : number = 0
  amountNoteCredit : number = 0

  lastBillCommon: number=0;
  lastBillExtraordinary : number = 0;
  lastBillIndividual : number = 0;
  lastBillNoteCredit: number = 0;

  amountLastYear: number=0;
  amountThisYear: number=0;

  constructor(private expenseReportService: ExpenseReportService,private cdRef: ChangeDetectorRef) {}

  chartExpensesPeriod = {
    type: 'PieChart' as ChartType,
    data: [] as [string,number][],
    options: {
      title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '100%', height: '90%' },
    }
  };
  chartLastBill={
    type: 'PieChart' as ChartType,
    data: [] as [string,number][],
    options: {
      title: 'Distribución de Gastos por Categoría',
      pieHole: 0.4,
      chartArea: { width: '100%', height: '90%' },
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
      chartArea: { width: '80%', height: '50%' },
      legend: { position: 'bottom' },
      colors: ['#4285F4', '#EA4335', '#34A853', '#FBBC05'],
      //tooltip: { isHtml: true }
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
        //this.updateKpi();
        this.filteredCharts();
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
    this.expenseKpiFiltered = this.filterTypeKpi(this.expenseKpis.slice());
    this.expenseKpiFiltered = this.filterCategoryKpi(this.expenseKpiFiltered);
    this.expenseKpiFiltered = this.filterProviderKpi(this.expenseKpiFiltered);
    this.amountCommon= this.sumAmounts('COMUN',this.expenseKpiFiltered);
    this.amountExtraordinary= this.sumAmounts('EXTRAORDINARIO',this.expenseKpiFiltered);
    this.amountIndividual= this.sumAmounts('INDIVIDUAL',this.expenseKpiFiltered);
    this.amountNoteCredit= this.sumAmounts('NOTE_OF_CREDIT',this.expenseKpiFiltered);
    const aggregatedData = this.sumAmountByCategory(this.expenseKpiFiltered);
    this.chartExpensesPeriod.data = aggregatedData;
    this.cdRef.detectChanges();
  }

  filterCategoryKpi(list : kpiExpense[]) : kpiExpense[]{
    
    if (this.selectedCategories && this.selectedCategories.length>0){
      const selectedCategoryIds = this.selectedCategories.map(category => category.id as number); // Extraer los ids de las categorías seleccionadas
      return list.filter(expense => selectedCategoryIds.includes(expense.categoryId)); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }
  filterTypeKpi(list : kpiExpense[]) : kpiExpense[]{
    
    if (this.selectedType && this.selectedType.length>0){
      const selectedTypeIds = this.selectedType.map(type => type.id); // Extraer los ids de las categorías seleccionadas
      return list.filter(expense => selectedTypeIds.includes(expense.expenseType)); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }
  filterProviderKpi(list : kpiExpense[]) : kpiExpense[]{
    
    if (this.selectedProviders && this.selectedProviders.length>0){
      const selectedProviderIds = this.selectedProviders.map(provider => provider.id); // Extraer los ids de las categorías seleccionadas
      return list.filter(expense => selectedProviderIds.includes(expense.providerId)); // Filtrar solo los que tienen un id que coincida
    }
    return list;
  }

  initialLastBillRecord(){
    this.expenseReportService.getLastBillRecord().pipe(take(1)).subscribe({
      next: (lastBillRecord: LastBillRecord)=>{
        this.lastBillRecord = lastBillRecord
        this.updateLastBillRecord();
      },
      error(error){
        console.log(error);
      }
    })
  }
  updateLastBillRecord(){
    if(this.lastBillRecord){
      this.lastBillRecordFiltered = this.filterTypeKpi(this.lastBillRecord.bills.slice());
      this.lastBillRecordFiltered = this.filterCategoryKpi(this.lastBillRecordFiltered);
      this.lastBillRecordFiltered = this.filterProviderKpi(this.lastBillRecordFiltered);
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
    this.comparateYearMonthFiltered = this.filerTypecomparateYearMonth(this.comparateYearMonth.slice());
    this.comparateYearMonthFiltered = this.filerCategorycomparateYearMonth(this.comparateYearMonthFiltered);
    this.comparateYearMonthFiltered = this.filerProvidercomparateYearMonth(this.comparateYearMonthFiltered);
    this.amountLastYear = this.sumAmountByYear(new Date().getFullYear()-1,this.comparateYearMonthFiltered)
    this.amountThisYear = this.sumAmountByYear(new Date().getFullYear(),this.comparateYearMonthFiltered)
    const data = this.sumAmountByYearMonth(this.comparateYearMonthFiltered);
    this.chartCompareYearMonth.data = data;
    this.cdRef.detectChanges();
  }
  
  filerCategorycomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(category => category.id);
      return list.filter(expense => selectedCategoryIds.includes(expense.categoryId));
    }
    return list;
  }
  filerTypecomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedType && this.selectedType.length > 0) {
      const selectedTypeIds = this.selectedType.map(type => type.id );
      return list.filter(expense => selectedTypeIds.includes(expense.expense_type));
    }
    return list;
  }
  filerProvidercomparateYearMonth(list: ExpenseData[]): ExpenseData[] {
    if (this.selectedProviders && this.selectedProviders.length > 0) {
      const selectedProviderIds = this.selectedProviders.map(provider => provider.id);
      return list.filter(expense => selectedProviderIds.includes(expense.providerId));
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

    const result = aggregatedData.map(([category, amount]) => [category, amount < 0 ? 0 : amount]);

    return result;
  }
  sumAmountByYearMonth(list: ExpenseData[]): any {
    const years = Array.from(new Set(list.map(d => d.year))).sort();
    if (years.length === 0) {
        years.push(new Date().getFullYear() - 1);
        years.push(new Date().getFullYear());
    }

    // Define las columnas para el gráfico
    this.chartCompareYearMonth.columns = ['Meses', ...years.map(year => year.toString())];

    // Crear objeto para almacenar la suma acumulada por mes y año
    const aggregatedData = list.reduce((acc, d) => {
        const key = `${d.year}-${d.month}`;
        if (!acc[key]) acc[key] = 0;
        acc[key] += d.amount;
        return acc;
    }, {} as Record<string, number>);

    // Calcular el monto máximo para ajustar la escala
    const maxAmount = Math.max(...Object.values(aggregatedData));
    let scale = 1;
    let scaleLabel = 'Monto ($)';

    if (maxAmount >= 1_000_000) {
        scale = 1_000_000;
        scaleLabel = 'Montos en millones de pesos';
    } else if (maxAmount >= 100_000) {
        scale = 1_000;
        scaleLabel = 'Montos en miles de pesos';
    }

    // Generar datos mensuales, aplicando la escala
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = months.map(month => {
        const monthName = new Date(0, month - 1).toLocaleString('es', { month: 'long' });
        const row = [monthName, ...years.map(year => {
            const key = `${year}-${month}`;
            return (aggregatedData[key] || 0) / scale;
        })];
        return row;
    });

    // Actualizar la etiqueta del eje vertical
    this.chartCompareYearMonth.options.vAxis.title = scaleLabel;

    return monthlyData;
}
  sumAmountByYear(year: number, list : any[]):number{
    const amount = list.filter(m=>m.year==year).reduce((sum,current)=>sum+current.amount,0);
    return amount;
  }


 get titleLAstYear(){
  return "Total "+(new Date().getFullYear()-1).toString();
 }
 get titleThisYear(){
  return "Total "+(new Date().getFullYear()).toString();
 }
 get percentageVariation(){
  if(this.amountLastYear==0)
    return 0;

  return (this.amountThisYear - this.amountLastYear) / this.amountLastYear
 }
 get titleCard(){
  return `Comparación Mensual de Gastos entre ${new Date().getFullYear()-1} y ${new Date().getFullYear()}`
 }

  
  filteredCharts(){
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
    this.selectedCategories=[];
    this.selectedProviders=[];
    this.selectedType=[];
    // this.filteredCharts();
    this.loadDates();
    this.filterDataOnChange();
  }
  changeView(view:number){
    this.cardView=view;
  }
}
