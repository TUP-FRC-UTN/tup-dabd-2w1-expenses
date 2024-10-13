import { Distributions } from "./distributions";

export interface Expense {
    description: string;
    providerId: number;
    expenseDate: Date;
    invoiceNumber: string;
    typeExpense: string;
    categoryId: number;
    amount: number;
    installments: number;
    distributions: Distributions[];
}
