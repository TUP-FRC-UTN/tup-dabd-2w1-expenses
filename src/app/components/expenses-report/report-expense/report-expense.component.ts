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
      const chartData = [
        ['Month', 'Amount'],
        ...data.map((item) => [`${item.year}-${item.month}`, item.amount])
      ];

      this.yearMonthChart = {
        chartType: 'ColumnChart',
        dataTable: chartData,
        options: { title: 'Expenses by Year and Month' },
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
