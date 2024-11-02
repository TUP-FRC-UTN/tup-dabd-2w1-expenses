import { Component, Input } from '@angular/core';
import { kpiExpense } from '../../../models/expenses-models/kpiExpense';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses-kpi.component.html',
  styleUrl: './expenses-kpi.component.scss'
})
export class ExpensesKpiComponent {

  @Input() amount : number =0
  @Input() title : string =''
  
}
