import { LootTable } from "./LootTable";

const CLASS_TABLE_IDENTIFER = '@c';
const TYPE_TABLE_IDENTIFER = '@t';
const POOL_TABLE_IDENTIFER = '@p';

export class Program {
    constructor() {
        this.fileList = [];
        this.classLootTables = [];
        this.typeLootTables = [];
        this.poolLootTables = [];
        this.historyCounter = 0;
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
            console.log("Class Loot Data");
            console.log(this.classLootTables);
            console.log("Type Loot Data");
            console.log(this.typeLootTables);
            console.log("Pool Loot Data");
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

            if (row.some(cell => cell.startsWith(CLASS_TABLE_IDENTIFER))){
                detectedStartIndex = row.findIndex(cell => cell.startsWith(CLASS_TABLE_IDENTIFER));
                tableType = 'class';
            } else if (row.some(cell => cell.startsWith(TYPE_TABLE_IDENTIFER))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith(TYPE_TABLE_IDENTIFER));
                tableType = 'type';
            } else if (row.some(cell => cell.startsWith(POOL_TABLE_IDENTIFER))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith(POOL_TABLE_IDENTIFER));
                tableType = 'pool';
            }

            if (detectedStartIndex !== -1) 
            {
                const tableName = row[detectedStartIndex].substring(2).trim();
                const colHeaders = tableData[i+1].slice(detectedStartIndex).filter(header => header !== '');

                //finds the index of rate value and ads a dice value col
                const rateValueIndex = colHeaders.findIndex(header => header.toLowerCase() === "rate value");
                if (rateValueIndex !== -1) {
                    colHeaders.splice(rateValueIndex + 1, 0, "Dice Value");
                }

                currentTable = this.getTableByName(tableName, tableType);

                //checking if the table already exists
                if(currentTable) 
                {
                    currentTable.updateHeaders(colHeaders);
                } 
                else
                {
                    currentTable = new LootTable(tableName, colHeaders);
                    this.addLootOption(`${tableType}LootDropdown`, tableName);
                }

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

        this.calculateDiceValues();
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

    
    addLootOption(dropdownId, tableName) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Create the new option element
            const option = document.createElement('option');
            option.value = tableName;
            option.textContent = tableName;
    
            // Append the new option to the select dropdown
            dropdown.appendChild(option);
    
            // If using Select2, we need to trigger an update after adding the option
            $(dropdown).trigger('change');  // Refresh the Select2 dropdown to show the new option
        }
    }

    getTableByName(tableName, tableType) {
        let tables;
        if (tableType === 'class') {
            tables = this.classLootTables;
        } else if (tableType === 'type') {
            tables = this.typeLootTables;
        } else if (tableType === 'pool') {
            tables = this.poolLootTables;
        }
        return tables ? tables.find(table => table.name === tableName) : null;
    }

    calculateDiceValues()
    {
        const allTables = [...this.classLootTables, ...this.typeLootTables];

    allTables.forEach(table => {
        let diceValueSum = 0;

        // Ensure "Dice Value" column exists
        if (!table.columns.includes("Dice Value")) {
            table.columns.push("Dice Value");
        }

        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];

            // Ensure row is an object
            if (typeof row !== "object") {
                console.error("Row is not an object:", row);
                continue;
            }

            // Get the "Rate Value" or "Drop Rate" field
            const rateValueKey = table.columns.find(header =>
                header.toLowerCase() === "rate value" || header.toLowerCase() === "drop rate"
            );

            const rateValue = parseInt(row[rateValueKey]) || 0;

            const diceStart = diceValueSum + 1;
            const diceEnd = diceValueSum + rateValue;

            // Assign Dice Value range as a new property
            row["Dice Value"] = rateValue > 1 ? `${diceStart}-${diceEnd}` : `${diceStart}`;

            // Update the cumulative dice value
            diceValueSum += rateValue;
        }

        // Store the max dice value in the table
        table.maxDiceValue = diceValueSum;
    });
    }

    rollItem(table)
    {
        if (!table) {
            return null;
        }

        let randomVal = Math.floor(Math.random() * table.maxDiceValue) + 1;

        for (let row of table.rows) {
            let diceValue = row["Dice Value"];

            //checks for a range and converts it to numbers
            if (diceValue.includes('-')) {
                const [min, max] = diceValue.split('-').map(Number);


                if (randomVal >= min && randomVal <= max) {
                    return row.Item;
                }
            } else {
                // If Dice Value is a single number
                if (randomVal === Number(diceValue)) {
                    return row.Item;
                }
            }
        }

    return null;
    }



    initProgram()
    {
        const rollBtn = document.getElementById("rollBtn");
        const classAmountField = document.getElementById("classLootAmount");
        const classChanceField = document.getElementById("classLootChance");
        const classDropdown = document.getElementById("classLootDropdown");

        const typeAmountField = document.getElementById("typeLootAmount");
        const typeChanceField = document.getElementById("typeLootChance");
        const typeDropdown = document.getElementById("typeLootDropdown");

        const outputBox = document.getElementById("outputText");
        const historyBox = document.getElementById("historyText");

        rollBtn.addEventListener("click", (e) => {
         
            let amountClassRolls = classAmountField.value;
            let chanceClassRolls = classChanceField.value;
            let className = classDropdown.value;

            let amountTypeRolls = typeAmountField.value;
            let chanceTypeRolls = typeChanceField.value;
            let typeName = typeDropdown.value;


            //roll class items
            for (let index = 0; index < amountClassRolls; index++) {
                let randomVal = Math.random() * 100;
                historyBox.innerHTML += `<span style="color: lightblue;">Rolling for Class Item ${index + 1}: <span style="color: white;">${randomVal.toFixed(2)}</span></span><br>`;

                if (randomVal < chanceClassRolls)
                {
                    historyBox.innerHTML += `<span style="color: green;"> → Item Dropped!</span><br>`;

                    if (!className || className.trim() === '') {
                        historyBox.innerHTML += `<span style="color: red;">No valid class name provided</span><br>`;
                        index += amountClassRolls; //pseudo return
                    }
            
                    let table = this.getTableByName(className, 'class');

                    if (table === null) {
                        historyBox.innerHTML += `<span style="color: red;">Table for class "${className}" doesn't exist</span><br>`;
                        index += amountClassRolls;
                    }

                    let itemPoolName = this.rollItem(table);
                    
                    if (itemPoolName === null)
                    {
                        `<span style="color: red;">Failed to get Item Pool Name</span><br>`;
                        index += amountClassRolls;
                    }
                    else
                    {
                        historyBox.innerHTML += `<span style="color: teal;"> → Pool: ${itemPoolName}</span><br>`;
                    }

                }
                else
                {
                    historyBox.innerHTML += `<span style="color: red;"> → No Item Dropped</span><br>`; 
                }

                historyBox.innerHTML += `<span style="color: gray;">--------------------</span><br>`;
                historyBox.scrollTop = historyBox.scrollHeight;
            }


            //roll type items
            for (let index = 0; index < amountTypeRolls; index++) {
                let randomVal = Math.random() * 100;
                console.log(`Rolling for Type Item ${index + 1}: ${randomVal}`);

                if (randomVal < chanceTypeRolls)
                {
                    console.log(`Item dropped!`);
                }
                else
                {
                    console.log(`No item dropped!`);
                }
            }

            this.historyCounter++;
            historyBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;
            historyBox.innerHTML += `<div style="color: white; margin-top: 5px;">${this.historyCounter}</div>`;
            historyBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;

        });

    }
}
