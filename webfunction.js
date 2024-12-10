//The code to use SQL in javascript
    initSqlJs({ wasmBinary }).then(SQL => {
    // Do database here

        document.getElementById("upload").addEventListener("change", function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                db = new SQL.Database(data);

                // Load and display tables
                loadAndDisplayTables();
            };

            reader.readAsArrayBuffer(file);
        });

        document.getElementById("run-query").addEventListener("click", function() {
            const query = document.getElementById("query-input").value;
            runQuery(query);
        });
    });

    function loadAndDisplayTables() {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
        if (tables.length === 0) {
            alert("No tables found in the uploaded database.");
            return;
        }

        tables[0].values.forEach(([tableName]) => {
            const result = db.exec(`SELECT * FROM ${tableName}`);
            if (result.length > 0) {
                createTable(result[0], tableName);
            }
        });
    }

    function createTable(data, tableName) {
        const table = document.createElement("table");
        const caption = document.createElement("caption");
        caption.textContent = `Table: ${tableName}`;
        table.appendChild(caption);

        const headerRow = document.createElement("tr");
        data.columns.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        data.values.forEach(row => {
            const rowElement = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                rowElement.appendChild(td);
            });
            table.appendChild(rowElement);
        });

        document.body.appendChild(table);
    }

    function runQuery(query) {
        try {
            const results = db.exec(query);
            displayQueryResults(results);
        } catch (err) {
            alert("Error in SQL query: " + err.message);
        }
    }

    function displayQueryResults(results) {
        const container = document.getElementById("query-results");
        container.innerHTML = "";

        if (results.length === 0) {
            container.textContent = "No results.";
            return;
        }

        results.forEach(result => {
            const table = document.createElement("table");
            const headerRow = document.createElement("tr");
            result.columns.forEach(col => {
                const th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            result.values.forEach(row => {
                const rowElement = document.createElement("tr");
                row.forEach(cell => {
                    const td = document.createElement("td");
                    td.textContent = cell;
                    rowElement.appendChild(td);
                });
                table.appendChild(rowElement);
            });

            container.appendChild(table);
        });
    }
