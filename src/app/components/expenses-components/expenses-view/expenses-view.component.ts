import { Component, inject, Input } from '@angular/core';
import {CommonModule,registerLocaleData } from '@angular/common'
import { ExpenseView } from '../../../models/expenses-models/expenseView';
import { FileService } from '../../../services/expenses-services/expenseFileService/file.service';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-AR');
@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [CommonModule],
  providers:[{ provide: 'LOCALE_ID', useValue: 'es-AR' }],
  templateUrl: './expenses-view.component.html',
  styleUrl: './expenses-view.component.css',

})
export class ExpenseViewComponent {

  @Input() expense: ExpenseView | null = null;
  private readonly fileService = inject(FileService);
  hasDistribution():Boolean{
    let result : Boolean = false;
    if(this.expense != null && this.expense.distributionList !=null && this.expense.distributionList.length>0){
      result =true;
    }
    return result;
  }
  downloadFile() {
    if (this.expense?.fileId) {
      this.fileService.downloadFile(this.expense.fileId);
    }
  }

}
