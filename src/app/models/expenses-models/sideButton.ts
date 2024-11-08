export class SideButton{
    icon : string;
    title : string;
    name: string;
    route? : string;
    roles : string[];
    childButtons? : SideButton[];

    constructor(){
        this.icon = "";
        this.name = "";
        this.title = "";
        this.route = "";
        this.roles = [];
        this.childButtons = [];
    }
}