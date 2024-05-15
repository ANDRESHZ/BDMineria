function exportTableToCSV(tableName) {
    const tablaClone = removeColumnByIndex([0, 1], "tb-" + tableName);
    const wb = XLSX.utils.table_to_book(tablaClone, { sheet: tableName });
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[tableName]);
    downloadFile(`${tableName}.csv`, csv);
}

function exportTableToXLSX(tableName) {
    const tablaClone = removeColumnByIndex([0, 1], "tb-" + tableName);
    const wb = XLSX.utils.table_to_book(tablaClone, { sheet: tableName });
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadFile(`${tableName}.xlsx`, blob);
}
function CrearBDGEO(tableName) {

}

function downloadFile(filename, data) {
    const a = document.createElement('a');
    const url = typeof data === 'string' ? 'data:text/plain;charset=utf-8,' + encodeURIComponent(data) : window.URL.createObjectURL(data);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        if (typeof data !== 'string') window.URL.revokeObjectURL(url);
    }, 0);
}

function continueTB(TBNAM) {
    FixedTB = true;
    TBFIXED = TBNAM;
}
document.addEventListener('DOMContentLoaded', async () => {
    const dataViewContainer = document.getElementById('data-view-container');
    const importCSVButton = document.getElementById('trigger-import-csv');
    const exportAllXLSXButton = document.getElementById('export-all-xlsx');
    const importCSVInput = document.getElementById('import-csv');

    function toggleVisibility(event) {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'h4') {
            const nextElement = target.nextElementSibling;
            if (nextElement && nextElement.tagName.toLowerCase() === 'table') {
                nextElement.classList.toggle('collapse');
                nextElement.classList.toggle('in');
                if (nextElement.classList.contains('in')) {
                    target.classList.add('expanded');
                    target.classList.remove('collapsed');
                } else {
                    target.classList.remove('expanded');
                    target.classList.add('collapsed');
                }
            } else {
                console.error('Next element is not a table:', nextElement);
            }
        }
    }
    dataViewContainer.addEventListener('click', toggleVisibility);
    async function fetchAndDisplaySubmissions() {
        const dataViewContainer = document.getElementById('data-view-container');
        dataViewContainer.innerHTML = '';
        const db = await dbPromise;
        const transaction = db.transaction('submissions', 'readonly');
        const store = transaction.objectStore('submissions');
        const request = store.getAll();
        request.onsuccess = (e) => {
            const submissions = e.target.result;
            if (submissions.length === 0) {
                dataViewContainer.innerHTML = '<p>No submissions found.</p>';
                return;
            }
            // Group submissions by tableName
            const groupedSubmissions = submissions.reduce((acc, submission) => {
                (acc[submission.tableName] = acc[submission.tableName] || []).push(submission);
                return acc;
            }, {});
            // Create a list for each group
            Object.keys(groupedSubmissions).forEach(tableName => {
                const groupContainer = document.createElement('div');
                groupContainer.innerHTML = `<h4 id="head-${tableName}">${tableName}</h4>`;
                const table = document.createElement('table');
                table.classList.add('table');
                table.id = "tb-" + tableName;
                if (firstTimeFecth == 0) {
                    table.classList.add("collapse");
                }
                else {
                    table.classList.add("in");
                }
                const tbody = document.createElement('tbody');
                let initHead = 0;
                let postimer = -1;
                groupedSubmissions[tableName].forEach((submission, index) => {
                    if (initHead == 0) {
                        initHead = 1;
                        const thead = document.createElement('thead');
                        const trHead = document.createElement('tr');
                        const Btns = document.createElement('th');
                        Btns.setAttribute('style', "text-wrap: nowrap;");
                        Btns.textContent = "✎Edit|Del🗑";
                        trHead.appendChild(Btns);
                        const indexTh = document.createElement('th');
                        indexTh.textContent = "#";
                        trHead.appendChild(indexTh);
                        let cont = 0;
                        Object.keys(submission.Data).forEach(key => {
                            if (!String(key).includes("timer")) {
                                const th = document.createElement('th');
                                th.textContent = key;
                                trHead.appendChild(th);
                            } else {
                                postimer = cont;
                            }
                            cont++;
                        });
                        const timerTh = document.createElement('th');
                        timerTh.textContent = '(mm:ss)';
                        const dateTh = document.createElement('th');
                        dateTh.textContent = 'Fecha';
                        const timerToggleTh = document.createElement('th');
                        timerToggleTh.classList.add('largeTXT');
                        timerToggleTh.textContent = '⏱';
                        trHead.appendChild(timerToggleTh);
                        trHead.appendChild(timerTh);
                        trHead.appendChild(dateTh);
                        thead.appendChild(trHead);
                        table.appendChild(thead);
                    }
                    let contT = 0;
                    const trBody = document.createElement('tr');
                    const tdED = document.createElement('td');
                    tdED.innerHTML = `<button class="btn btn-sm1 btn-warning" onclick="window.editSubmission(${submission.IDGen})">💱</button> <button class="btn btn-sm1 btn-info" onclick="window.deleteSubmission(${submission.IDGen})">⛔</button>`;
                    trBody.appendChild(tdED);
                    const tdID = document.createElement('td');
                    tdID.textContent = submission.IDGen;
                    trBody.appendChild(tdID);
                    Object.values(submission.Data).forEach(value => {
                        if (postimer != contT) {
                            const td = document.createElement('td');
                            td.textContent = value;
                            trBody.appendChild(td);
                        }
                        contT++;
                    });
                    contT = 0;
                    const timerTd = document.createElement('td');
                    timerTd.textContent = `${LPad2(submission.Timer.minutes, 2)}:${LPad2(submission.Timer.seconds, 2)}`;
                    const dateTd = document.createElement('td');
                    dateTd.classList.add("smallTXT");
                    let dtS = new Date(submission.DateTime);
                    dateTd.textContent = dtS.getFullYear() + "/" + LPad2(dtS.getMonth() + 1, 2) + "/" + LPad2(dtS.getDate(), 2) + " " + LPad2(dtS.getHours(), 2) + ":" + LPad2(dtS.getMinutes(), 2) + ":" + LPad2(dtS.getSeconds(), 2);
                    const timerToggleTd = document.createElement('td');
                    timerToggleTd.textContent = submission.Data["timer-toggle"][0] ? '✅' : '🚫';
                    trBody.appendChild(timerToggleTd);
                    trBody.appendChild(timerTd);
                    trBody.appendChild(dateTd);
                    tbody.appendChild(trBody);

                });
                table.appendChild(tbody);
                groupContainer.appendChild(table);
                dataViewContainer.appendChild(groupContainer);

                const downloadCSVButton = document.createElement('button');
                downloadCSVButton.textContent = '💾CSV';
                downloadCSVButton.setAttribute("class", "btn btn-sm btn-success btn-sm1");
                downloadCSVButton.addEventListener('click', () => exportTableToCSV(tableName));
                downloadCSVButton.setAttribute("style", "margin-left: 2px;")
                groupContainer.appendChild(downloadCSVButton);

                const downloadXLSXButton = document.createElement('button');
                downloadXLSXButton.textContent = '💾XLSX';
                downloadXLSXButton.setAttribute("class", "btn btn-sm1 btn-sm btn-success");
                downloadXLSXButton.setAttribute("style", "margin-left: 4px;")
                downloadXLSXButton.addEventListener('click', () => exportTableToXLSX(tableName));
                groupContainer.appendChild(downloadXLSXButton);

                const ContinueEdit = document.createElement('button');
                ContinueEdit.textContent = '➕Continuar TB ';
                ContinueEdit.setAttribute("class", "btn btn-sm1 btn-sm btn-warning");
                ContinueEdit.setAttribute("style", "margin-left: 4px;")
                ContinueEdit.addEventListener('click', () => continueTB(tableName));
                groupContainer.appendChild(ContinueEdit);

                const CreateXLSXSalida = document.createElement('button');
                CreateXLSXSalida.textContent = '📀Crear BD GEO ';
                CreateXLSXSalida.setAttribute("class", "btn btn-sm1 btn-sm btn-info");
                CreateXLSXSalida.setAttribute("style", "margin-left: 4px;")
                CreateXLSXSalida.addEventListener('click', () => exportTBToXLSXGEO(tableName));
                groupContainer.appendChild(CreateXLSXSalida);
            });
            if (firstTimeFecth == 0) { firstTimeFecth = 1; }
        };
    }

    async function exportAllToXLSX() {
        const db = await dbPromise;
        const transaction = db.transaction('submissions', 'readonly');
        const store = transaction.objectStore('submissions');
        const request = store.getAll();

        request.onsuccess = (e) => {
            const submissions = e.target.result;
            if (submissions.length === 0) {
                console.log('No submissions to export.');
                return;
            }
            const groupedSubmissions = submissions.reduce((acc, submission) => {
                (acc[submission.tableName] = acc[submission.tableName] || []).push(submission);
                return acc;
            }, {});
            const wb = XLSX.utils.book_new();
            Object.keys(groupedSubmissions).forEach(tableName => {
                let contttt = 0;
                const titles = groupedSubmissions[tableName].map(submission => {
                    if (contttt == 0) {
                        contttt = 1;
                        const Datos = submission.Data;
                        const Datos2 = Object.fromEntries(Object.entries(submission).filter(e => e[0] != 'Data'));
                        const sendData = Object.assign(Datos, Datos2)
                        const sendDataUNion = Object.keys(sendData);
                        return Object.values(sendDataUNion);
                    }
                });
                const ws_data = groupedSubmissions[tableName].map(submission => {
                    const Datos = submission.Data;
                    const Datos2 = Object.fromEntries(Object.entries(submission).filter(e => e[0] != 'Data'));
                    Datos2.Timer = "'" + LPad2(String(Datos2.Timer.minutes), 2) + ":" + LPad2(String(Datos2.Timer.seconds), 2);
                    let dtS = new Date(Datos2.DateTime);
                    Datos2.DateTime = "'" + dtS.getFullYear() + "/" + LPad2(dtS.getMonth() + 1, 2) + "/" + LPad2(dtS.getDate(), 2) + " " + LPad2(dtS.getHours(), 2) + ":" + LPad2(dtS.getMinutes(), 2) + ":" + LPad2(dtS.getSeconds(), 2);
                    const sendData = Object.assign(Datos, Datos2)
                    return Object.values(sendData);
                });
                ws_data.unshift(titles[0]); //TAABLA COMPLETA
                const ws = XLSX.utils.aoa_to_sheet(ws_data);
                // console.log(ws_data); 
                XLSX.utils.book_append_sheet(wb, ws, tableName);
            });
            XLSX.writeFile(wb, 'All-Submissions.xlsx');
        };
        request.onerror = (e) => {
            console.error('Error exporting all submissions to XLSX:', e.target.error);
        };
    }

    async function importCSV(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected for import.');
            return;
        }
        Papa.parse(file, {
            complete: async (results) => {
                const db = await dbPromise;
                const transaction = db.transaction('submissions', 'readwrite');
                const store = transaction.objectStore('submissions');
                const userName = sessionStorage.getItem('user') || 'unknown';
                const userMail = sessionStorage.getItem('mail') || 'unknown@mail.com';
                // console.log(results.data);
                results.data.forEach(async (row, index) => {
                    if (index === 0) return; // Assuming first row is headers
                    const submission = { Data: {} };
                    // Dynamically mapping CSV columns to form fields based on headers
                    results.meta.fields.forEach((field, columnIndex) => {
                        // console.log(field, ":", row[field], index, columnIndex);
                        if (field == "Timer" || field == "(mm:ss)") {
                            let timtxt = String(row[field]).replace("'", "").split(":");
                            let Timer = { minutes: parseInt(timtxt[0]), seconds: String(parseInt(timtxt[1])) };
                            submission.Timer = Timer;
                        } else {
                            if (field == "Date" || field == "Fecha") {
                                let fechatxt = String(row[field]).replace("'", "");
                                submission.DateTime = new Date(moment(fechatxt).format('YYYY/MM/DD hh:mm:ss'));
                            }
                            else {
                                if (field == "favorite-mineral") {
                                    submission.Data[field] = [row[field]];
                                } else {
                                    if (row[field] == "true" || row[field] == "false") {
                                        submission.Data[field] = row[field] == "true" ? true : false;
                                        if (field == "timer-toggle") {
                                            submission.TEnable = row[field] == "true" ? true : false;
                                        }
                                    } else {
                                        submission.Data[field] = row[field];
                                    }
                                }
                            }
                        }

                    });
                    // Additional processing for specific fields if necessary
                    // submission.DateTime = new Date();
                    submission.tableName = `Imported-${new Date().toISOString().slice(0, 10)}`;
                    submission.userName = userName;
                    submission.userMail = userMail;
                    // console.log(submission);
                    await store.add(submission);
                });
                console.log('CSV import completed.');
                await fetchAndDisplaySubmissions();
            },
            header: true,
            error: (error) => {
                console.error('Error parsing CSV file:', error);
            }
        });

    }
    exportAllXLSXButton.addEventListener('click', exportAllToXLSX);
    importCSVButton.addEventListener('click', () => importCSVInput.click());
    importCSVInput.addEventListener('change', importCSV);
    await fetchAndDisplaySubmissions();
});
async function exportTBToXLSXGEO(TBNAMEACT) {
    const db = await dbPromise;
    const transaction = db.transaction('submissions', 'readonly');
    const store = transaction.objectStore('submissions');
    const request = store.getAll();

    request.onsuccess = (e) => {
        const submissions = e.target.result;
        if (submissions.length === 0) {
            console.log('No submissions to export.');
            return;
        }
        const groupedSubmissions = submissions.reduce((acc, submission) => {
            (acc[submission.tableName] = acc[submission.tableName] || []).push(submission);
            return acc;
        }, {});
        const wb = XLSX.utils.book_new();
        Object.keys(groupedSubmissions).forEach(tableName => {
            if (TBNAMEACT == tableName) {
                let contttt = 0;
                let titles = groupedSubmissions[tableName].map(submission => {
                    if (contttt == 0) {
                        contttt = 1;
                        const Datos = submission.Data;
                        const Datos2 = Object.fromEntries(Object.entries(submission).filter(e => e[0] != 'Data'));
                        const sendData = Object.assign(Datos, Datos2)
                        const sendDataUNion = Object.keys(sendData);
                        return Object.values(sendDataUNion);
                    }
                });
                titles[0].push("PESO MUESTRA", "HOLE_ID", "SAMPLE ID", "SAMPLE_TYPE", "DEPTH_TO", "DRILL_MIN", "PEBBLES_TYPE", "% PEBBLES", "SALINITY", "STANDARD", "PARENT_SAMPLE_ID")//nuevos campos
                const ws_data = groupedSubmissions[tableName].map(submission => {
                    const Datos = submission.Data;
                    const Datos2 = Object.fromEntries(Object.entries(submission).filter(e => e[0] != 'Data'));
                    Datos2.Timer = "'" + LPad2(String(Datos2.Timer.minutes), 2) + ":" + LPad2(String(Datos2.Timer.seconds), 2);
                    let dtS = new Date(Datos2.DateTime);
                    Datos2.DateTime = "'" + dtS.getFullYear() + "/" + LPad2(dtS.getMonth() + 1, 2) + "/" + LPad2(dtS.getDate(), 2) + " " + LPad2(dtS.getHours(), 2) + ":" + LPad2(dtS.getMinutes(), 2) + ":" + LPad2(dtS.getSeconds(), 2);
                    const Datos3 = {
                        "PESO MUESTRA": (String(Datos.PSI) + "cal"),
                        "HOLE_ID": (submission.Data.PROJECT + "RC" + submission.Data["hole-code"]),
                        "SAMPLE ID": submission.Data.PROJECT + submission.Data["sample-data"],
                        "SAMPLE_TYPE": "STD CALC",
                        "DEPTH_TO": String(parseFloat(String(submission.Data["depth-from"]).replace(",", ".")) + 0.5).replace(".", ","),
                        "DRILL_MIN": String(Datos.PSI) + "cal2",
                        "PEBBLES_TYPE": determinarPEBBLES_TYPE(submission.Data.lithology_1[0], submission.Data.lithology_2[0]),
                        "% PEBBLES": determinarPercetPEBBLES(submission.Data.lithology_1[0], submission.Data.lithology_2[0]),
                        "SALINITY": resultadoSALINITY(submission.Data.lithology_1[0], submission.Data.lithology_2[0]),
                        "STANDARD": "STD CALC",
                        "PARENT_SAMPLE_ID": "AZAR SampleType"
                    };
                    const sendData = Object.assign(Datos, Datos2, Datos3)

                    return Object.values(sendData);
                });
                ws_data.unshift(titles[0]); //TAABLA COMPLETA
                const ws = XLSX.utils.aoa_to_sheet(ws_data);
                XLSX.utils.book_append_sheet(wb, ws, tableName);
            }
        });
        XLSX.writeFile(wb, 'All-Submissions.xlsx');
    };
    request.onerror = (e) => {
        console.error('Error exporting all submissions to XLSX:', e.target.error);
    };
}
const LPad2 = (num, places) => String(num).padStart(places, '0');

function removeColumnByIndex(colIndexes, IDtable) {
    let idxs = colIndexes.sort(function (a, b) { return b - a });
    const tableOB = document.querySelector("#" + String(IDtable)).cloneNode(true);
    let rows = tableOB.getElementsByTagName("tr");
    idxs.forEach(colIndex => {
        for (var i = 0; i < rows.length; i++) {
            let cells = rows[i].getElementsByTagName("td");
            if (idxs[idxs.length - 1] == colIndex) {
                try {
                    for (let icellth = 0; icellth < cells.length; icellth++) {
                        if (cells[icellth].innerHTML == "✅" || cells[icellth].innerHTML == "🚫") {
                            cells[icellth].innerHTML = cells[icellth].innerHTML == "✅" ? true : false;
                        }
                    }
                    cells[cells.length - 1].innerHTML = "'" + String(cells[cells.length - 1].innerHTML);
                    cells[cells.length - 2].innerHTML = "'" + String(cells[cells.length - 2].innerHTML);
                } catch {

                }
            }
            if (cells.length > colIndex) {
                cells[colIndex].remove();
            }
        }
        for (var i = 0; i < rows.length; i++) {
            let Cellsth = rows[i].getElementsByTagName("th");
            if (idxs[idxs.length - 1] == colIndex) {
                for (let icellth = 0; icellth < Cellsth.length; icellth++) {
                    if (Cellsth[icellth].innerHTML == "⏱") {
                        Cellsth[icellth].innerHTML = "timer-toggle";
                    }
                }
            }
            if (Cellsth.length > colIndex) {
                Cellsth[colIndex].remove();
            }
        }
    });
    return tableOB;
}
function determinarPEBBLES_TYPE(Lit1, Lit2) {
    const grupoR = ["CHUS", "ARCI", "SULP", "CALH", "CALC", "CALS", "RIPI", "GRAV"];
    const grupoN = ["ARCI", "SULP"];
    // Casos donde el resultado es 'R'
    if ((Lit1 === "CHUS" && grupoR.includes(Lit2)) ||
        (Lit1 === "ARCI" && grupoR.includes(Lit2)) ||
        (Lit1 === "SULP" && grupoR.includes(Lit2)) ||
        (Lit1 === "CALH" && grupoR.includes(Lit2)) ||
        (Lit1 === "CALC" && grupoR.includes(Lit2)) ||
        (Lit1 === "CALS" && grupoR.includes(Lit2)) ||
        (Lit1 === "RIPI" && grupoR.includes(Lit2))) {
        return 'R';
    }
    // Casos donde el resultado es 'N'
    if ((Lit1 === "ARCI" && grupoN.includes(Lit2)) ||
        (Lit1 === "SULP" && grupoN.includes(Lit2))) {
        return 'N';
    }
    // Casos donde el resultado es 'A'
    if (Lit2 === "GRAV") {
        return 'A';
    }
    // Si no se cumple ninguna condición anterior
    return "ERROR";
}
function determinarPercetPEBBLES(Lit1, Lit2) {
    const grupo1 = ["ARCI", "SULP", "CALH", "CALC", "CALS"];
    const grupo2 = ["RIPI", "GRAV"];
    // Condicionales basadas en Lit1
    if (Lit1 === "CHUS") {
        if (grupo1.includes(Lit2)) {
            return "1";
        } else if (Lit2 === "CHUS" || grupo2.includes(Lit2)) {
            return "2";
        }
    } else if (Lit1 === "ARCI") {
        if (Lit2 === "ARCI" || Lit2 === "SULP") {
            return "0";
        } else if (grupo1.includes(Lit2)) {
            return "1";
        } else if (grupo2.includes(Lit2)) {
            return "2";
        }
    } else if (Lit1 === "SULP") {
        if (Lit2 === "ARCI" || Lit2 === "SULP") {
            return "0";
        } else {
            return "1";
        }
    } else if (["CALH", "CALC", "CALS"].includes(Lit1)) {
        if (grupo1.includes(Lit2)) {
            return "1";
        } else if (grupo2.includes(Lit2)) {
            return "2";
        }
    } else if (Lit1 === "RIPI") {
        if (grupo1.includes(Lit2)) {
            return "3";
        } else if (grupo2.includes(Lit2)) {
            return "4";
        }
    } else if (Lit1 === "GRAV") {
        if (grupo1.includes(Lit2)) {
            return "3";
        } else if (grupo2.includes(Lit2)) {
            return "4";
        }
    }
    // Si ninguna condición se cumple
    return "ERROR";
}
function resultadoSALINITY(Lit1, Lit2) {
    const grupos = {
        CHUS: ["CHUS", "ARCI", "RIPI", "GRAV"],
        CALC1: ["CALH", "CALC", "CALS"],
        ARCI: ["ARCI", "CALH", "CALC", "CALS"],
        CALC2: ["CHUS", "ARCI", "SULP"],
        SULP: ["SULP", "RIPI", "GRAV"],
        RIPI: ["RIPI", "GRAV"],
        GRAV: ["CHUS", "ARCI", "SULP"]
    };
    const aleatorioEntre = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    if (Lit1 === "CHUS") {
        if (Lit2 === "SULP") return "0";
        else if (grupos.CHUS.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(1, 2).toString();
    } else if (Lit1 === "ARCI") {
        if (grupos.ARCI.includes(Lit2)) return aleatorioEntre(1, 2).toString();
        else if (grupos.GRAV.includes(Lit2)) return aleatorioEntre(0, 1).toString();
    } else if (Lit1 === "SULP") {
        if (grupos.SULP.includes(Lit2)) return "0";
        else if (grupos.GRAV.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (Lit2 === "CALH") return aleatorioEntre(1, 2).toString();
    } else if (Lit1 === "CALH") {
        if (grupos.CALC2.includes(Lit2)) return aleatorioEntre(1, 2).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(2, 3).toString();
    } else if (Lit1 === "CALC") {
        if (grupos.CALC2.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (grupos.RIPI.includes(Lit2)) return aleatorioEntre(1, 2).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(2, 3).toString();
    } else if (Lit1 === "CALS") {
        if (grupos.CALC2.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (grupos.RIPI.includes(Lit2)) return aleatorioEntre(1, 2).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(2, 3).toString();
    } else if (Lit1 === "RIPI") {
        if (grupos.RIPI.includes(Lit2)) return "0";
        else if (grupos.GRAV.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(1, 2).toString();
    } else if (Lit1 === "GRAV") {
        if (grupos.RIPI.includes(Lit2)) return "0";
        else if (grupos.GRAV.includes(Lit2)) return aleatorioEntre(0, 1).toString();
        else if (grupos.CALC1.includes(Lit2)) return aleatorioEntre(1, 2).toString();
    }
    return "ERROR";
}