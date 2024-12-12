//The code to use SQL in javascript
    initSqlJs({ wasmBinary }).then(SQL => {
    // Do database here

        document.getElementById("upload").addEventListener("change", function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                db = new SQL.Database(data);

                //replace the blank value with unknown
                //replaceBlank(db);

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
        // Populate Rocket dropdown
        const rocketQuery = "SELECT DISTINCT Name FROM Rockets ORDER BY Name";
        const rockets = db.exec(rocketQuery);
        const rocketSelect = document.getElementById("rocket-select");
        rocketSelect.innerHTML = '<option value="">All Rockets</option>';
        
        if (rockets.length > 0) {
            rockets[0].values.forEach(([rocket]) => {
                const option = document.createElement("option");
                option.value = rocket;
                option.textContent = rocket;
                rocketSelect.appendChild(option);
            });
        }

        // Populate Mission dropdown
        const missionQuery = "SELECT DISTINCT Name FROM Missions ORDER BY Name";
        const missions = db.exec(missionQuery);
        const missionSelect = document.getElementById("mission-select");
        missionSelect.innerHTML = '<option value="">All Missions</option>';
        
        if (missions.length > 0) {
            missions[0].values.forEach(([mission]) => {
                const option = document.createElement("option");
                option.value = mission;
                option.textContent = mission;
                missionSelect.appendChild(option);
            });
        }

        // Set date range limits based on mission dates
        const dateQuery = "SELECT MIN(Date), MAX(Date) FROM Missions";
        const dates = db.exec(dateQuery);
        if (dates.length > 0 && dates[0].values.length > 0) {
            const [minDate, maxDate] = dates[0].values[0];
            document.getElementById("date-start").value = minDate;
            document.getElementById("date-end").value = maxDate;
        }

        // Add event listener for reset filters button
        document.getElementById("reset-filters").addEventListener("click", function() {
            document.getElementById("rocket-select").value = "";
            document.getElementById("mission-select").value = "";
            document.getElementById("date-start").value = "";
            document.getElementById("date-end").value = "";
            document.getElementById("search-filter").value = "";
        });

    } catch (err) {
        console.error("Error populating filters:", err);
    }
}

// Function to apply filters and run query
function applyFilters() {
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

function applyFilters() {
    if (!validateDateRange()) {
        return;
    }
}