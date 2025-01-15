export class Program {
    constructor() {
        this.fileList = [];
        this.newData = [];
    }


    addFile(file) {
        this.fileList.push(file);
        console.log(`added ${file.name}`);
        

        const reader = new FileReader();

    }

    loadNewData() {
        const reader = new FileReader();
    
        newData.forEach((file, index) => {
            reader.onload = (event) => {
                const fileContent = event.target.result;
                console.log(`Finished Reading ${file.name}`);
                console.log(fileContent);

                this.newData.splice(index, 1);
            }
    
            reader.onerror = (error) => {
                console.error("Error reading file", error);
            }

            reader.readAsText(file);
        });
    }
}