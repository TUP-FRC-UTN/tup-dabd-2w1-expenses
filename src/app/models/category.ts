export class Category {
    id: number;
    description: string;
    lastUpdatedDatetime: Date;
    estate:string;
  
    constructor() {
      this.id = 0;
      this.description = '';
      this.lastUpdatedDatetime = new Date();
      this.estate=''
    }
  }
