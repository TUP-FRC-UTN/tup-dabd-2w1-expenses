import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
export class ExpenseProvidersNgSelectComponent implements OnInit, OnDestroy {
  constructor(private providerService: ProviderService){}
  providersList : Provider[] = [];
  @Input() selectedProviders: Provider[] =[];
  @Output() selectedProvidersChange = new EventEmitter<Provider[]>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.providerService.getProviders()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe(
        (providers) => {
          this.providersList = providers;
        },
        (error) => {
          console.error('Error loading providers:', error);
        }
      );
  }


  // onProviderChange(): void {
  //   this.selectedProvidersChange.emit(this.selectedProviders);
  // }
  onProviderChange(): void {
    this.selectedProvidersChange.emit(
      this.selectedProviders.map(provider => ({
        ...provider,
        id: Number(provider.id)  // Forzar `id` como número
      }))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
}
