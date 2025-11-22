// --------------------
// Table state history for Undo
// --------------------
let tableHistory = [];
const MAX_HISTORY = 20;

// --------------------
// Initialize Helper Page
// --------------------
function initHelperPage() {
    console.log("Initializing helper.js");

    const table = document.getElementById("excelGrid");
    const defaultColumns = 5;
    const defaultRows = 10;

    // Load saved table
    let savedData = JSON.parse(localStorage.getItem("helperTableData") || "null");

    const numCols = savedData ? savedData[0].length : defaultColumns;
    const numRows = savedData ? savedData.length : defaultRows;

    const colLetters = [];
    for (let i = 0; i < numCols; i++) colLetters.push(String.fromCharCode(65 + i));

    table.innerHTML = "";

    // Header row with copy buttons
    const header = table.insertRow();
    colLetters.forEach((letter, colIndex) => {
        const th = document.createElement("th");
        th.style.position = "relative";

        const span = document.createElement("span");
        span.innerText = letter;
        th.appendChild(span);

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

    // Table body
    for (let r = 0; r < numRows; r++) {
        const row = table.insertRow();
        for (let c = 0; c < numCols; c++) {
            const td = document.createElement("td");
            td.contentEditable = "true";
            if (savedData && savedData[r] && savedData[r][c] !== undefined) {
                td.innerText = savedData[r][c];
            }
            row.appendChild(td);
        }
    }

    // Track edits
    table.addEventListener("input", () => saveTableToLocalStorage());

    // --------------------
    // Clear All button
    // --------------------
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            saveTableToLocalStorage(); // save current state to history
            localStorage.removeItem("helperTableData");
            initHelperPage(); // reset table
            console.log("Table reset to initial 10x5 size");
        });
    }

    // --------------------
    // Remove N/A rows button
    // --------------------
    const removeNaBtn = document.getElementById("removeNaBtn");
    if (removeNaBtn) {
        removeNaBtn.addEventListener("click", () => {
            saveTableToLocalStorage(); // save current state to history

            let rowsDeleted = 0;
            for (let r = table.rows.length - 1; r > 0; r--) { // skip header
                const cellB = table.rows[r].cells[1]; // column B
                if (cellB && cellB.innerText.trim().toUpperCase() === "N/A") {
                    table.deleteRow(r);
                    rowsDeleted++;
                }
            }

            saveTableToLocalStorage(false); // save new state, don't push history again
            console.log(`Removed ${rowsDeleted} rows with N/A in column B`);
        });
    }

    // --------------------
    // Undo button
    // --------------------
    const undoBtn = document.getElementById("undoBtn");
    if (undoBtn) {
        undoBtn.addEventListener("click", () => {
            if (tableHistory.length === 0) {
                console.log("Nothing to undo");
                return;
            }

            const prevState = JSON.parse(tableHistory.pop());

            // Clear table (except header)
            while (table.rows.length > 1) table.deleteRow(1);

            // Restore previous state
            prevState.forEach(rowData => {
                const row = table.insertRow();
                rowData.forEach(cellData => {
                    const td = document.createElement("td");
                    td.contentEditable = "true";
                    td.innerText = cellData;
                    row.appendChild(td);
                });
            });

            localStorage.setItem("helperTableData", JSON.stringify(prevState));
            console.log("Undo applied");
        });
    }
}

// --------------------
// Save table state
// --------------------
function saveTableToLocalStorage(pushHistory = true) {
    const table = document.getElementById("excelGrid");
    const data = [];

    for (let r = 1; r < table.rows.length; r++) {
        const rowData = [];
        for (let c = 0; c < table.rows[r].cells.length; c++) {
            rowData.push(table.rows[r].cells[c].innerText);
        }
        data.push(rowData);
    }

    if (pushHistory) {
        tableHistory.push(JSON.stringify(data));
        if (tableHistory.length > MAX_HISTORY) tableHistory.shift();
    }

    localStorage.setItem("helperTableData", JSON.stringify(data));
}

// --------------------
// Paste support
// --------------------
document.addEventListener("paste", function (event) {
    const active = document.activeElement;
    if (!active || active.tagName !== "TD") return;

    event.preventDefault();

    const table = document.getElementById("excelGrid");
    const text = (event.clipboardData || window.clipboardData).getData("text");

    const rowsData = text.split(/\r?\n/);
    const parsed = rowsData.map(r => r.split("\t"));

    const startCell = active;
    let startRow = startCell.parentElement.rowIndex - 1; // skip header
    let startCol = startCell.cellIndex;

    let currentRows = table.rows.length - 1;
    let currentCols = table.rows[0].cells.length;

    const neededRows = startRow + parsed.length;
    let maxColsNeeded = startCol;
    parsed.forEach(row => {
        if (startCol + row.length > maxColsNeeded) maxColsNeeded = startCol + row.length;
    });
    const neededCols = maxColsNeeded;

    // Add columns if needed
    if (neededCols > currentCols) {
        const header = table.rows[0];
        for (let c = currentCols; c < neededCols; c++) {
            const th = document.createElement("th");
            th.innerText = String.fromCharCode(65 + c);

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
        for (let r = 1; r < table.rows.length; r++) {
            for (let c = currentCols; c < neededCols; c++) {
                const td = document.createElement("td");
                td.contentEditable = "true";
                table.rows[r].appendChild(td);
            }
        }
    }

    // Add rows if needed
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

    // Paste data
    parsed.forEach((cols, i) => {
        const rowIndex = startRow + i + 1;
        const rowCells = table.rows[rowIndex].cells;
        cols.forEach((colText, j) => {
            rowCells[startCol + j].innerText = colText;
        });
    });

    saveTableToLocalStorage();
});

// --------------------
// Copy column
// --------------------
function copyColumn(colIndex) {
    const table = document.getElementById("excelGrid");
    const rows = Array.from(table.rows).slice(1);

    const values = rows.map(row => row.cells[colIndex].innerText);

    let first = values.findIndex(v => v.trim() !== "");
    let last = values.length - 1 - [...values].reverse().findIndex(v => v.trim() !== "");

    if (first === -1) return;

    const toCopy = values.slice(first, last + 1).join("\n");

    navigator.clipboard.writeText(toCopy)
        .then(() => console.log(`Copied column ${colIndex}`))
        .catch(err => console.error("Copy failed:", err));
}
