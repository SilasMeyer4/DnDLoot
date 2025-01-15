import { LootTable } from "./LootTable";

const classTableIdentifier = '@c';

export class Program {
    constructor() {
        this.fileList = [];
        this.classLootTables = [];
        this.typeLootTables = [];
        this.poolLootTables = [];
    }


    addFile(file) {
        this.fileList.push(file);
        console.log(`added ${file.name}`);
        
        const testArea = document.getElementById("testText");
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            console.log(`Finished Reading ${file.name}`);
            this.parseCSVData(fileContent);
            console.log(this.classLootTables);
            console.log(this.typeLootTables);
            console.log(this.poolLootTables);

            testArea.value = this.classLootTables;
           
        }

        reader.onerror = (error) => {
            console.error("Error reading file", error);
        }

        reader.readAsText(file);

    }

    parseCSVData(data)
    {
        const tableData = data.split('\n').map(row => row.split(',').map(cell => cell.trim()));

        let currentTable = null;
        let isParsingTable = false;
        let tableStartColIndex = -1;

        for (let i = 0; i < tableData.length; i++)
        {
            const row = tableData[i];

            if(row.every(cell => cell === "")) 
            {
                //found empty row. Marking end of table;
                isParsingTable = false;
                currentTable = null;
                tableStartColIndex = -1;
                continue;
            } 

            let detectedStartIndex = -1;
            let tableType = '';

            if (row.some(cell => cell.startsWith(classTableIdentifier))){
                detectedStartIndex = row.findIndex(cell => cell.startsWith(classTableIdentifier));
                tableType = 'class';
            } else if (row.some(cell => cell.startsWith('@t'))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith('@t'));
                tableType = 'type';
            } else if (row.some(cell => cell.startsWith('@p'))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith('@p'));
                tableType = 'pool';
            }

            if (detectedStartIndex !== -1) 
            {
                const tableName = row[detectedStartIndex].substring(2).trim();
                const colHeaders = tableData[i+1].slice(detectedStartIndex).filter(header => header !== '');

                currentTable = new LootTable(tableName, colHeaders);

                if (tableType === 'class') {
                    this.classLootTables.push(currentTable);
                } else if (tableType === 'type') {
                    this.typeLootTables.push(currentTable);
                } else if (tableType === 'pool') {
                    this.poolLootTables.push(currentTable);
                }

                isParsingTable = true;
                tableStartColIndex = detectedStartIndex;
                i++; //skip header row and go to data
                continue;
            } 

            if (isParsingTable && currentTable)
            {
                const dataRow = row.slice(tableStartColIndex);
                currentTable.addRow(dataRow);
            }


        }
    }

    getSymbolPositions(array2D, symbol)
    {
        const positions = [];

        array2D.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.includes(symbol)) {
                    positions.push({row: rowIndex, col: colIndex});
                }
            })
        });
        return positions;
    }
   
}