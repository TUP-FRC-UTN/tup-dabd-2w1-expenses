export interface BillViewOwner {
    id: string;
    description: string;
    providerId: string | number;
    expenseDate: [number, number, number];
    expenseType: string;
    categoryDescription: string;
    amount: number;
  }
  