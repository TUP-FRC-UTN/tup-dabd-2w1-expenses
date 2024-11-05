import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProviderService } from '../../../../services/expenses-services/providerServices/provider.service';
import { Provider } from '../../../../models/expenses-models/provider';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expense-providers-ng-select',
  standalone: true,
  imports: [NgSelectModule,FormsModule],
  providers:[ProviderService],
  templateUrl: './expense-providers-ng-select.component.html',
  styleUrl: './expense-providers-ng-select.component.scss'
})
export class ExpenseProvidersNgSelectComponent implements OnInit, OnDestroy  {

  @Input() selectedProviders: Provider[] =[];
  @Input() selectedProvider: number=0;
  @Input() multiple:Boolean=true;
  @Input() emptyValue: Boolean= false;
  @Output() selectedProvidersChange = new EventEmitter<Provider[]>();
  @Output() selectedProviderChange = new EventEmitter<number>();
  
  
  
  providersList : Provider[] = [];
  private destroy$ = new Subject<void>();
  constructor(private providerService: ProviderService){}
  ngOnInit(): void {
    this.loadProviders();
    console.log(this.selectedProvider)
  }
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }


  loadProviders(): void {
    this.providerService.getProviders()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe(
        (providers) => {
          this.providersList = providers;
          if (this.emptyValue) {
            this.providersList.push({ id: 0, description: '' });
            this.providersList.sort((a, b) => a.description.localeCompare(b.description));
          }
        },
        (error) => {
          console.error('Error loading providers:', error);
        }
      );
  }
  onProviderChange(): void {
    if(this.multiple){
      this.selectedProvidersChange.emit(this.selectedProviders);
    }else{
      this.selectedProviderChange.emit(this.selectedProvider);
    }
  }
  set selectValue(value:any){
    if(this.multiple){
      this.selectedProviders = value;
    }else{
      this.selectedProvider = value;
    }
  }
  get selectValue(){
    return this.multiple ? this.selectedProviders : this.selectedProvider
  }
  
}
