import { Component, Input } from '@angular/core';
import { kpiExpense } from '../../../models/expenses-models/kpiExpense';
import { CommonModule,registerLocaleData  } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-AR');
@Component({
  selector: 'app-expenses-kpi',
  standalone: true,
  imports: [CommonModule],
  providers:[{ provide: 'LOCALE_ID', useValue: 'es-AR' }],
  templateUrl: './expenses-kpi.component.html',
  styleUrl: './expenses-kpi.component.scss'
})
export class ExpensesKpiComponent {

  @Input() amount : number =0
  @Input() title : string =''
  
}
