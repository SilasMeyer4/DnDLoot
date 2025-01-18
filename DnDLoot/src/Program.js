import { LootTable } from "./LootTable";

const CLASS_TABLE_IDENTIFER = '@c';
const TYPE_TABLE_IDENTIFER = '@t';
const POOL_TABLE_IDENTIFER = '@p';
const CLASS = 'class';
const TYPE = 'type';
const POOL = 'pool';
const ITEM_NAME = 'Name';
const POOL_NAME = "Pool Name";
const DICE_VALUE = "Dice Value";
const RATE = "Rate Value";
const POOL_IDs = "Pool ID";
const POOL_ITEM_ID = "Pool ID"

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
                tableType = CLASS;
            } else if (row.some(cell => cell.startsWith(TYPE_TABLE_IDENTIFER))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith(TYPE_TABLE_IDENTIFER));
                tableType = TYPE;
            } else if (row.some(cell => cell.startsWith(POOL_TABLE_IDENTIFER))) {
                detectedStartIndex = row.findIndex(cell => cell.startsWith(POOL_TABLE_IDENTIFER));
                tableType = POOL;
            }

            if (detectedStartIndex !== -1) 
            {
                const tableName = row[detectedStartIndex].substring(2).trim();
                const colHeaders = tableData[i+1].slice(detectedStartIndex).filter(header => header !== '');

                //finds the index of rate value and ads a dice value col
                colHeaders.push("Dice Value")

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

                if (tableType === CLASS) {
                    this.classLootTables.push(currentTable);
                } else if (tableType === TYPE) {
                    this.typeLootTables.push(currentTable);
                } else if (tableType === POOL) {
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
        if (tableType === CLASS) {
            tables = this.classLootTables;
        } else if (tableType === TYPE) {
            tables = this.typeLootTables;
        } else if (tableType === POOL) {
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
                    return { poolName: row["Item Pool"], poolIDs: row["Pool ID"], rateValue: row["Rate Value"]};
                }
            } else {
                // If Dice Value is a single number
                if (randomVal === Number(diceValue)) {
                    return {poolName: row["Item Pool"], poolIDs: row["Pool ID"], rateValue: row["Rate Value"]};
                }
            }
        }

    return null;
    }

    getItemFromPool(itemPoolData)
    {

        const table = this.poolLootTables.find(table => table.name === itemPoolData.poolName);
            if (table)
            {
                const poolIDValue = itemPoolData.poolIDs;
                let pickedItemID;

                if (poolIDValue.includes('-')) {
                    const [min, max] = poolIDValue.split('-').map(Number);
                    pickedItemID = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    pickedItemID = parseInt(poolIDValue);
                }

                console.log(`${pickedItemID} is picked ID`)
                
            
                let item = table.rows.find(row => {
                    const poolIDInRow = parseInt(row["Pool ID"]);
                    return poolIDInRow === pickedItemID;
                });

                if (item !== undefined) {
                    console.log(item);
                    return item;
                }

            }
 
        return null;
    }

    rollLootItems(lootTables, amountRolls, chanceRolls, dropdownValue, historyBox, outputBox) {
        // Loop to handle loot rolls
        for (let index = 0; index < amountRolls; index++) {
            let randomVal = Math.random() * 100;
            historyBox.innerHTML += `<span style="color: lightblue;">Rolling for Item ${index + 1}: <span style="color: white;">${randomVal.toFixed(2)}</span></span><br>`;
    
            // Check if item is dropped based on chance
            if (randomVal < chanceRolls) {
                historyBox.innerHTML += `<span style="color: green;"> → Item Dropped!</span><br>`;
    
                if (!dropdownValue || dropdownValue.trim() === '') {
                    historyBox.innerHTML += `<span style="color: red;">No valid item pool provided</span><br>`;
                    index += amountRolls; // pseudo return to exit loop
                }
    
                let table = this.getTableByName(dropdownValue, lootTables);
    
                if (table === null) {
                    historyBox.innerHTML += `<span style="color: red;">Table for pool "${dropdownValue}" doesn't exist</span><br>`;
                    index += amountRolls; // exit loop
                }
    
                let itemPoolData = this.rollItem(table);
                const nameCol = table.columns.find(header =>
                    header.toLowerCase() === "item pool"
                );
                
                if (itemPoolData === null) {
                    historyBox.innerHTML += `<span style="color: red;">Failed to get Item Pool Name</span><br>`;
                    index += amountRolls; // exit loop
                } else {
                    historyBox.innerHTML += `<span style="color: teal;"> → Pool: ${itemPoolData.poolName}</span><br>`;
    
                    let item = this.getItemFromPool(itemPoolData);
                    console.log(item);
    
                    if (item === null) {
                        historyBox.innerHTML += `<span style="color: red;"> Pool or Pool ID does not exist</span><br>`;
                    } else {
                        historyBox.innerHTML += `<span style="color: green;"> → ${item["Name"]} ID: ${item["Pool ID"]}</span><br>`;
                        outputBox.innerHTML += `<span style="color: green;"> → ${item["Name"]} was dropped</span><br>`;
                        outputBox.scrollTop = outputBox.scrollHeight;
                    }
                }
    
            } else {
                historyBox.innerHTML += `<span style="color: red;"> → No Item Dropped</span><br>`; 
            }
    
            historyBox.innerHTML += `<span style="color: gray;">--------------------</span><br>`;
            historyBox.scrollTop = historyBox.scrollHeight;
        }
    }

    doRolls(amountField, chanceField, dropdown, kindOfTable)
    {
        let amount = amountField.value;
        let chance = chanceField.value;
        let name = dropdown.value;

        const historyBox = document.getElementById("historyText");
        const outputBox = document.getElementById("outputText");
        let hasOutputLoot = false;

        for (let index = 0; index < amount; index++) {
            let randomVal = Math.random() * 100;
            historyBox.innerHTML += `<span style="color: lightblue;">Rolling for Class Item ${index + 1}: <span style="color: white;">${randomVal.toFixed(2)}</span></span><br>`;

            if (randomVal < chance)
            {
                historyBox.innerHTML += `<span style="color: green;"> → Item Dropped!</span><br>`;

                if (!name || name.trim() === '') {
                    historyBox.innerHTML += `<span style="color: red;">No valid class name provided</span><br>`;
                    return false;
                }
        
                let table = this.getTableByName(name, kindOfTable); //gets the type or class table

                if (table === null) {
                    historyBox.innerHTML += `<span style="color: red;">Table for class "${name}" doesn't exist</span><br>`;
                    return false;
                }

                let itemPoolData = this.rollItem(table); //fetches the Information about the in the type class table 
                const nameCol = table.columns.find(header =>
                    header.toLowerCase() === "item pool"
                );
                
                if (itemPoolData === null)
                {
                    historyBox.innerHTML += `<span style="color: red;">Failed to get Item Pool Name</span><br>`;
                    return false;
                }
                else
                {
                    historyBox.innerHTML += `<span style="color: teal;"> → Pool: ${itemPoolData.poolName} (${((itemPoolData.rateValue / table.maxDiceValue) * 100).toFixed(2)}%)</span><br>`;

                    let item = this.getItemFromPool(itemPoolData);

                    console.log(item);

                    if (item === null)
                    {
                        historyBox.innerHTML += `<span style="color: red;"> Pool or Pool ID does not exist</span><br>`;
                    }
                    else
                    {
                        historyBox.innerHTML += `<span style="color: green;"> → ${item["Name"]} ID: ${item["Pool ID"]}</span><br>`;
                        outputBox.innerHTML += `<span style="color: green;"> → ${item["Name"]} was dropped</span><br>`;
                        outputBox.scrollTop = outputBox.scrollHeight;
                        hasOutputLoot = true;
                    }
                }

            }
            else
            {
                historyBox.innerHTML += `<span style="color: red;"> → No Item Dropped</span><br>`; 
            }

            historyBox.innerHTML += `<span style="color: gray;">--------------------</span><br>`;
        }

        return hasOutputLoot;
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

        const historyBox = document.getElementById("historyText");
        const outputBox = document.getElementById("outputText");

        rollBtn.addEventListener("click", (e) => {
         
            let hasOutputLoot = false;

            if (this.doRolls(classAmountField, classChanceField, classDropdown, "class") || this.doRolls(typeAmountField, typeChanceField, typeDropdown, "type"))
            {
                hasOutputLoot = true;
            }
        
            this.historyCounter++;
            historyBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;
            historyBox.innerHTML += `<div style="color: white; margin-top: 5px;">${this.historyCounter}</div>`;
            historyBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;

            if (!hasOutputLoot)
            {
                outputBox.innerHTML += `<div style="color: red; margin-top: 5px;">Nothing</div>`;
            }
            outputBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;
            outputBox.innerHTML += `<div style="color: white; margin-top: 5px;">${this.historyCounter}</div>`;
            outputBox.innerHTML += `<div style="background-color: gray; height: 5px; width: 100%; margin-top: 10px; margin-bottom: 10px;"></div>`;

            historyBox.scrollTop = historyBox.scrollHeight;
            outputBox.scrollTop = outputBox.scrollHeight;
        });

    }
}
