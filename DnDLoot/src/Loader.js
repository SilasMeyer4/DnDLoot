import { Program } from "./Program";

export function initLoader(program) {

    const dropZone = document.getElementById("dropZone");
    const filePathInput = document.getElementById("filePath");
    const urlField = document.getElementById("urlText");
    const fileField = document.getElementById("filePath");
    const loadBtn = document.getElementById("loadBtn");
    var dropedFile = null;

    function checkLoaderInputs()
    {
        if(urlField.value !== "" && fileField.value !== "")
        {
            loadBtn.disabled = true;
            loadBtn.innerHTML = "Invalid";
            loadBtn.style.backgroundColor = "";
        }
        else if (urlField.value === "" && fileField.value === "")
        {
            loadBtn.disabled = true;
            loadBtn.innerHTML = "Load";
            loadBtn.style.backgroundColor = "";  
        } else {
            loadBtn.disabled = false;
            loadBtn.innerHTML = "Load";
            loadBtn.style.backgroundColor = "#4CAF50";
        }
    }

    urlField.addEventListener("change", checkLoaderInputs);
    fileField.addEventListener("change", checkLoaderInputs);


    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".csv"))
        {
            filePathInput.value = file.name;
            dropedFile = file;
            checkLoaderInputs();
        } 
        else
        {
            alert("Invalid file");
        }

    });

    document.getElementById("clearBtn").addEventListener("click", () => {

        if (confirm("This will delete ALL saved data!!! Are you sure, you want to delete everything?"))
        {
            document.getElementById("urlText").value = "Sucessfully Deleted Data";
            filePathInput.value = "Sucessfully Deleted Data";
        }
    });

    loadBtn.addEventListener("click", async () => {
        
        if (dropedFile && fileField.value !== "")
        {
            program.addFile(dropedFile);
        } 
        else if (urlField.vale !== null)
        {
            var fetchedFile = await fetchCSV(convertURLToExportCVSURL(urlField.value));
            if (fetchedFile)
            {
                program.addFile(fetchedFile);
            }
            else
            {
                console.error("Error adding fetched data");
            }
        
        }
    });

}

export function convertURLToExportCVSURL(sheetUrl)
{
    const loadBtn = document.getElementById("loadBtn");
    loadBtn.innerHTML = "Fetching Data...";

    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit\?gid=([0-9]+)/;
    const match = sheetUrl.match(regex);

    if (match)
    {
        const sheetId = match[1];
        const gid = match[2];

        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    } else {
        return null;
    }

}

export async function fetchCSV(sheetUrl) {

    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        console.log("fetched data");

        const blob = new Blob([data], {type: 'text/csv/'});

        const file = new File([blob], 'fetchedData.csv', {type: 'text/csv/'});
        loadBtn.innerHTML = "Load";
        return file
    } catch(error) {
        console.error("Error fetching CSV data:", error);
        loadBtn.innerHTML = "Error";
        loadBtn.style.backgroundColor = "#4CAF50";
        return null;
    }
}




