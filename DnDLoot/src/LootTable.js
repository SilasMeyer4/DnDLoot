export class LootTable {
    constructor(name, columns) {
        this.name = name;
        this.columns = columns;
        this.rows = [];
    }

    addRow(rowData){
        let rowObject = {};
        this.columns.forEach((col, index) => {
            rowObject[col] = rowData[index] || "";
        });
        this.rows.push(rowObject);
    }
}