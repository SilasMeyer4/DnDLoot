export class LootTable {
    constructor(name, columns) {
        this.name = name;
        this.columns = columns;
        this.rows = [];
        this.maxDiceValue = 0;
    }

    addRow(rowData){
        let rowObject = {};
        this.columns.forEach((col, index) => {
            rowObject[col] = rowData[index] || "";
        });
        this.rows.push(rowObject);
    }

    /**
     * Updates an already existing table.
     * @param { } newHeaders 
     */
    updateHeaders(newHeaders) {
        this.headers = newHeaders;
        this.rows = [];
    }
}