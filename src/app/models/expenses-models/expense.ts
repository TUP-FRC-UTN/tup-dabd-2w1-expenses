import { Distributions } from "./distributions";

export interface Expense {
    id?:number;
    description: string;
    providerId: number;
    expenseDate: string;
    invoiceNumber: string;
    typeExpense: string;
    categoryId: number;
    amount: number;
    fileId: string;
    installments: number;
    distributions: Distributions[];
}
