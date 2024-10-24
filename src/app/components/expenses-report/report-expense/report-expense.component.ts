import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface, Ng2GoogleChartsModule } from 'ng2-google-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseReportService } from '../../../services/expenseReportServices/expense-report.service';

@Component({
  standalone: true,
  selector: 'app-report-expense',
  imports: [CommonModule, FormsModule, Ng2GoogleChartsModule],
  templateUrl: './report-expense.component.html',
  styleUrl: './report-expense.component.scss'
})
export class ReportExpenseComponent implements OnInit {
  public startDate: string = '';
  public endDate: string = '';
  public yearMonthChart: GoogleChartInterface = { chartType: '', dataTable: [], options: {} };
  public categoriesPeriodChart: GoogleChartInterface = { chartType: '', dataTable: [], options: {} };

  constructor(private reportChartService: ExpenseReportService) { }

  ngOnInit(): void {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    this.startDate = lastYear.toISOString().split('T')[0]; // Hace 1 año
    this.endDate = today.toISOString().split('T')[0];      // Fecha actual

    this.loadCharts();
  }

  loadCharts(): void {
    this.loadYearMonthChart();
    this.loadCategoriesPeriodChart();
  }

  loadYearMonthChart(): void {
    this.reportChartService.getYearMonth(this.startDate, this.endDate).subscribe((data) => {
      // Crear arrays para almacenar los datos por año
      const currentYearData: number[] = new Array(12).fill(0);
      const previousYearData: number[] = new Array(12).fill(0);
  
      // Obtenemos el año actual y el anterior desde las fechas seleccionadas
      const startDateYear = new Date(this.startDate).getFullYear();
      const endDateYear = new Date(this.endDate).getFullYear();
  
      // Iteramos sobre los datos recibidos y los organizamos por mes y año
      data.forEach(item => {
        if (item.year === endDateYear) {
          currentYearData[item.month - 1] = item.amount; // Datos para el año actual
        } else if (item.year === startDateYear) {
          previousYearData[item.month - 1] = item.amount; // Datos para el año anterior
        }
      });
  
      // Preparar los datos para Google Charts
      const chartData = [
        ['Mes', `${startDateYear}`, `${endDateYear}`],
        ['Enero', previousYearData[0], currentYearData[0]],
        ['Febrero', previousYearData[1], currentYearData[1]],
        ['Marzo', previousYearData[2], currentYearData[2]],
        ['Abril', previousYearData[3], currentYearData[3]],
        ['Mayo', previousYearData[4], currentYearData[4]],
        ['Junio', previousYearData[5], currentYearData[5]],
        ['Julio', previousYearData[6], currentYearData[6]],
        ['Agosto', previousYearData[7], currentYearData[7]],
        ['Septiembre', previousYearData[8], currentYearData[8]],
        ['Octubre', previousYearData[9], currentYearData[9]],
        ['Noviembre', previousYearData[10], currentYearData[10]],
        ['Diciembre', previousYearData[11], currentYearData[11]],
      ];
  
      // Configuramos el gráfico combinado
      this.yearMonthChart = {
        chartType: 'ComboChart',
        dataTable: chartData,
        options: {
          title: 'Gastos por Año y Mes',
          vAxis: { title: 'Monto' },
          hAxis: { title: 'Mes' },
          seriesType: 'bars', // Las barras comparan ambos años
        },
      };
    });
  }
  
  loadCategoriesPeriodChart(): void {
    this.reportChartService.getCategoriesPeriod(this.startDate, this.endDate).subscribe((data) => {
      const chartData = [
        ['Category', 'Amount'],
        ...data.map((item) => [item.category, item.amount])
      ];

      this.categoriesPeriodChart = {
        chartType: 'PieChart',
        dataTable: chartData,
        options: { title: 'Expenses by Category', pieHole: 0.4 },
      };
    });
  }
}
