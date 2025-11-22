function initHelperPage() {
    console.log("Initializing helper.js");

    const table = document.getElementById("excelGrid");

    const columns = 5;   // number of columns
    const rows = 10;     // number of initial rows

    const colLetters = [];
    for (let i = 0; i < columns; i++) {
        colLetters.push(String.fromCharCode(65 + i));
    }

    table.innerHTML = "";

    // Create header row with copy buttons
    const header = table.insertRow();
    colLetters.forEach((letter, colIndex) => {
        const th = document.createElement("th");
        th.style.position = "relative";

        // Column label
        const span = document.createElement("span");
        span.innerText = letter;
        th.appendChild(span);

        // Copy button
        const btn = document.createElement("button");
        btn.innerText = "📋";
        btn.title = "Copy this column";
        btn.style.marginLeft = "5px";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => copyColumn(colIndex));

        th.appendChild(btn);

        header.appendChild(th);
    });

    // Create initial body rows
    for (let r = 0; r < rows; r++) {
        const row = table.insertRow();
        for (let c = 0; c < columns; c++) {
            const td = document.createElement("td");
            td.contentEditable = "true";
            row.appendChild(td);
        }
    }
}

// --------------------
// Paste handler
// --------------------
document.addEventListener("paste", function (event) {
    const active = document.activeElement;
    if (!active || active.tagName !== "TD") return;

    event.preventDefault();

    const table = document.getElementById("excelGrid");

    const text = (event.clipboardData || window.clipboardData).getData("text");

    // Split rows and KEEP empty lines
    const rowsData = text.split(/\r?\n/); // <-- do NOT filter

    // Split each row into columns by tab
    const parsed = rowsData.map(r => r.split("\t"));

    const startCell = active;
    let startRow = startCell.parentElement.rowIndex - 1; // skip header
    let startCol = startCell.cellIndex;

    let currentRows = table.rows.length - 1; // exclude header
    let currentCols = table.rows[0].cells.length;

    // Determine how many rows and columns are needed
    const neededRows = startRow + parsed.length;
    let maxColsNeeded = startCol;
    parsed.forEach(row => {
        const rowCols = row.length;
        if (startCol + rowCols > maxColsNeeded) maxColsNeeded = startCol + rowCols;
    });
    const neededCols = maxColsNeeded;

    // Add columns if necessary
    if (neededCols > currentCols) {
        const header = table.rows[0];
        for (let c = currentCols; c < neededCols; c++) {
            const th = document.createElement("th");
            th.innerText = String.fromCharCode(65 + c); // A, B, C...
            
            // Copy button for new column
            const btn = document.createElement("button");
            btn.innerText = "📋";
            btn.title = "Copy this column";
            btn.style.marginLeft = "5px";
            btn.style.fontSize = "12px";
            btn.style.cursor = "pointer";
            btn.addEventListener("click", () => copyColumn(c));
            th.appendChild(btn);

            header.appendChild(th);
        }

        // Add new TDs to existing rows
        for (let r = 1; r < table.rows.length; r++) {
            for (let c = currentCols; c < neededCols; c++) {
                const td = document.createElement("td");
                td.contentEditable = "true";
                table.rows[r].appendChild(td);
            }
        }
    }

    // Add new rows if necessary
    if (neededRows > currentRows) {
        for (let r = currentRows; r < neededRows; r++) {
            const row = table.insertRow();
            for (let c = 0; c < table.rows[0].cells.length; c++) {
                const td = document.createElement("td");
                td.contentEditable = "true";
                row.appendChild(td);
            }
        }
    }

    // Paste data into table (including blank rows)
    parsed.forEach((cols, i) => {
        const rowIndex = startRow + i + 1; // +1 to skip header
        const rowCells = table.rows[rowIndex].cells;

        cols.forEach((colText, j) => {
            const colIndex = startCol + j;
            rowCells[colIndex].innerText = colText; // can be empty string
        });
    });
});


// --------------------
// Copy column function
// --------------------
function copyColumn(colIndex) {
    const table = document.getElementById("excelGrid");
    const rows = Array.from(table.rows).slice(1); // skip header

    // Collect values in the column, including blanks
    const values = rows.map(row => row.cells[colIndex].innerText);

    // Find first and last non-empty row
    let first = values.findIndex(v => v.trim() !== "");
    let last = values.length - 1 - [...values].reverse().findIndex(v => v.trim() !== "");

    if (first === -1) return; // nothing to copy

    // Include all rows between first and last, keeping blanks
    const toCopy = values.slice(first, last + 1).join("\n");

    // Copy to clipboard
    navigator.clipboard.writeText(toCopy)
        .then(() => console.log(`Copied column ${colIndex}`))
        .catch(err => console.error("Copy failed:", err));
}
