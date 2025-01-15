export class Program {
    constructor() {
        this.fileList = [];
    }


    addFile(file) {
        this.fileList.push(file);
        console.log(`added ${file.name}`);
        
        const testArea = document.getElementById("testText");
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            console.log(`Finished Reading ${file.name}`);
            testArea.value = (this.parseCSVData(fileContent));
            const data = this.parseCSVData(fileContent)
            console.log(data);
            console.log(this.getSymbolPositions(data, '@'));
        }

        reader.onerror = (error) => {
            console.error("Error reading file", error);
        }

        reader.readAsText(file);

    }

    parseCSVData(data)
    {
        const rows = data.split('\n');

        const parsedData = rows.map(row => row.split(',').map(cell => cell.trim())
                                        .filter(cell => cell !== "")
                                    ).filter(row => row.length > 0);
    
        return parsedData;
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