import { Distribution } from "./distribution";

export interface Bill {
    id: number;
    category: string;
    provider: string;
    amount: number;
    expenseType: string;
    createdDatetime: Date;

    //Consultar
    distributionList: Distribution[];
    
}
