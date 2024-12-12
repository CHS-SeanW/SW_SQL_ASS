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
                const button = document.createElement("button", id = 'display-tables-btn');
                button.textContent = "Display Tables";
                button.addEventListener("click", function() {
                    loadAndDisplayTables(db);
                });
                document.getElementById("display-tables-container").appendChild(button);
                // Populate filters after database load
                populateFilters();
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
            console.log(results)
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



    function populateFilters() {
        try {
            // Rocket filters
            const rocketQueries = {
                'rocket-name': "SELECT DISTINCT Name FROM Rockets ORDER BY Name",
                'company': "SELECT DISTINCT Cmp FROM Rockets ORDER BY Cmp",
                'status': "SELECT DISTINCT Status FROM Rockets ORDER BY Status",
                'stages': "SELECT DISTINCT Stages FROM Rockets ORDER BY Stages",
                'strap-ons': "SELECT DISTINCT [Strap-ons] FROM Rockets ORDER BY [Strap-ons]"
            };
    
            // Mission filters
            const missionQueries = {
                'mission-name': "SELECT DISTINCT Mission FROM Missions ORDER BY Mission",
                'location': "SELECT DISTINCT Location FROM Missions ORDER BY Location",
                'mission-status': "SELECT DISTINCT MissionStatus FROM Missions ORDER BY MissionStatus"
            };
    
            // Populate rocket filters
            for (const [elementId, query] of Object.entries(rocketQueries)) {
                const results = db.exec(query);
                const select = document.getElementById(elementId);
                select.innerHTML = `<option value="">All ${elementId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`;
                
                if (results.length > 0) {
                    results[0].values.forEach(([value]) => {
                        if (value !== null && value !== "") {
                            const option = document.createElement("option");
                            option.value = value;
                            option.textContent = value;
                            select.appendChild(option);
                        }
                    });
                }
            }
    
            // Populate mission filters
            for (const [elementId, query] of Object.entries(missionQueries)) {
                const results = db.exec(query);
                const select = document.getElementById(elementId);
                select.innerHTML = `<option value="">All ${elementId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`;
                
                if (results.length > 0) {
                    results[0].values.forEach(([value]) => {
                        if (value !== null && value !== "") {
                            const option = document.createElement("option");
                            option.value = value;
                            option.textContent = value;
                            select.appendChild(option);
                        }
                    });
                }
            }
    
        } catch (err) {
            console.error("Error populating filters:", err);
        }
    }

// Function to apply filters and run query
function applyFilters() {
    if (!validateDateRange()) {
        return;
    }

    const rocket = document.getElementById("rocket-select").value;
    const mission = document.getElementById("mission-select").value;
    const dateStart = document.getElementById("date-start").value;
    const dateEnd = document.getElementById("date-end").value;

    let query = `
        SELECT 
            M.Name as Mission_Name,
            M.Date,
            R.Name as Rocket_Name,
            R.Type as Rocket_Type,
            M.Outcome
        FROM Missions M
        JOIN Rockets R ON M.Rocket = R.Name
        WHERE 1=1
    `;

    if (rocket) {
        query += ` AND R.Name = '${rocket}'`;
    }
    if (mission) {
        query += ` AND M.Name = '${mission}'`;
    }
    if (dateStart) {
        query += ` AND M.Date >= '${dateStart}'`;
    }
    if (dateEnd) {
        query += ` AND M.Date <= '${dateEnd}'`;
    }

    query += " ORDER BY M.Date";

    runQuery(query);
}

function validateDateRange() {
    const dateStart = document.getElementById("date-start").value;
    const dateEnd = document.getElementById("date-end").value;
    
    if (dateStart && dateEnd && dateStart > dateEnd) {
        alert("Start date cannot be later than end date");
        return false;
    }
    return true;
}