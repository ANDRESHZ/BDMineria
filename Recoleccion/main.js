var firstTimeFecth = 0;
var FixedTB = false;
var TBFIXED = "";
document.addEventListener('DOMContentLoaded', () => {
    console.log("Mineral Industrial Data Collectors SPA ready!");
    const formLink = document.getElementById('link-form');
    const dataViewLink = document.getElementById('link-data-view');
    const formContainer = document.getElementById('form-container');
    const dataViewContainer = document.getElementById('data-view-container');
    const btnExportALL = document.getElementById('export-all-xlsx');
    const btnImport = document.getElementById('trigger-import-csv');
    const divSub = document.getElementById('submit-container');
    const divEdit = document.getElementById('edit-container');
    const setActiveLink = (activeLink) => {
        formLink.classList.remove('active');
        dataViewLink.classList.remove('active');
        activeLink.classList.add('active');
    };
    var startTime, endTime;
    var timerEnabled = false;
    //Inicio timer 
    function startTimer() {
        startTime = new Date();
        if (timerEnabled) {
            displayTimeInfo("Timer started. Fill the form and submit when done.");
        }
    }
    //Fin timer 
    function endTimer() {
        if (timerEnabled) {
            endTime = new Date();
            const elapsedTime = calculateElapsedTime(startTime, endTime);
            displayTimeInfo(`Form filled in ${elapsedTime.minutes}min ${elapsedTime.seconds}sec.`);
            console.log("Timer ended at:", endTime, "Elapsed time:", elapsedTime);
        } else {
            displayTimeInfo("Timer is OFF");
        }
    }
    //calculo timer 
    function calculateElapsedTime(start, end) {
        const elapsed = end - start;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = ((elapsed % 60000) / 1000).toFixed(0);
        return {
            minutes,
            seconds
        };
    }
    //Mostrar timer
    function displayTimeInfo(message) {
        const timeInfoContainer = document.getElementById('time-info-container');
        if (!timeInfoContainer) {
            console.error('Time info container not found.');
            return;
        }
        timeInfoContainer.textContent = message;
    }
    //Mostrar Formulario
    formLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink(formLink);
        divEdit.classList.add('d-none');
        divSub.classList.remove('d-none');
        formContainer.classList.remove('d-none');
        dataViewContainer.classList.add('d-none');
        btnExportALL.classList.add('d-none');
        btnImport.classList.add('d-none');
        formContainer.style.opacity = 0;
        setTimeout(() => { formContainer.style.opacity = 1; }, 100);
    });
    //Mostrar Dataview
    dataViewLink.addEventListener('click', async (e) => {
        e.preventDefault();
        setActiveLink(dataViewLink);
        divEdit.classList.add('d-none');
        divSub.classList.remove('d-none');
        dataViewContainer.classList.remove('d-none');
        formContainer.classList.add('d-none');
        btnExportALL.classList.remove('d-none');
        btnImport.classList.remove('d-none');
        dataViewContainer.style.opacity = 0;
        btnExportALL.style.opacity = 0;
        btnImport.style.opacity = 0;
        firstTimeFecth = 0;
        setTimeout(() => dataViewContainer.style.opacity = 1, 100);
        setTimeout(() => btnExportALL.style.opacity = 1, 100);
        setTimeout(() => btnImport.style.opacity = 1, 100);
        await fetchAndDisplaySubmissions();
    });
    // Error handling for navigation functionality
    try {
        if (!formLink || !dataViewLink || !formContainer || !dataViewContainer) {
            throw new Error("One or more navigation elements are missing in the DOM.");
        }
    } catch (error) {
        console.error("Navigation setup error:", error.message);
        console.error(error.stack);
    }
    setActiveLink(formLink);
    formContainer.classList.remove('d-none');
    dataViewContainer.classList.add('d-none');
    formContainer.style.opacity = 0;
    setTimeout(() => formContainer.style.opacity = 1, 100);
    // Listen for the timerToggle event to enable/disable the timer
    document.addEventListener('timerToggle', (e) => {
        const inputSec = document.getElementById('secsInput');
        const inputMin = document.getElementById('minsInput');
        const span2p = document.getElementById('span2p');
        timerEnabled = e.detail.start;
        if (timerEnabled) {
            startTimer();
            document.getElementById('label-timer-chk').innerHTML = "< STOP the Timer...";
            inputSec.classList.add('d-none');
            inputMin.classList.add('d-none');
            span2p.classList.add('d-none');
        } else {
            inputSec.classList.remove('d-none');
            inputMin.classList.remove('d-none');
            span2p.classList.remove('d-none');
            displayTimeInfo("Timer not started.");
            document.getElementById('label-timer-chk').innerHTML = "< Re-Start Timer...";
        }
    });
    // Function to dynamically add event listener to the submit button when the form is loaded
    function attachSubmitListener() {
        const submitButton = document.querySelector('#form-submit');
        if (submitButton) {
            submitButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const formData = serializeFormData();
                console.log("Form data to be stored:", formData);
                try {
                    let tbNM = TBFIXED;
                    if (!FixedTB) {
                        tbNM = await generateTableName();
                    }
                    await storeSubmission(formData, tbNM);
                } catch (error) {
                    console.error('Error storing form data in IndexedDB:', error.message);
                    console.error(error.stack);
                }
            });
        } else {
            console.error('Submit button not found.');
        }
    }
    // Edicion de datos
    function attachSubmitListener1() {
        const editButton = document.querySelector('#form-edit');
        if (editButton) {
            editButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const formData = serializeFormData();
                console.log("Form data to be stored:", formData);
                try {
                    let tbNM = editButton.getAttribute("tableName");
                    let IDtable = editButton.getAttribute("IDtable");
                    FixedTB = false;
                    await editSubmissions(formData, tbNM, IDtable);
                    setActiveLink(dataViewLink);
                    formContainer.classList.add('d-none');
                    dataViewContainer.classList.remove('d-none');
                    dataViewContainer.style.opacity = 0;
                    setTimeout(() => dataViewContainer.style.opacity = 1, 100);
                    fetchAndDisplaySubmissions(); // Refresh the data view wit
                    // await fetchAndDisplaySubmissions(); // Refresh the data view with new submissions
                } catch (error) {
                    console.error('Error storing form data in IndexedDB:', error.message);
                    console.error(error.stack);
                }
            });
        } else {
            console.error('Submit button not found.');
        }
    }
    document.addEventListener('formLoaded', () => {
        attachSubmitListener();
        attachSubmitListener1();
        const completeButton = document.getElementById('end-submission');
        if (completeButton) {
            completeButton.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent default action
                const formData = serializeFormData(); // Serialize form data
                try {
                    FixedTB = false;
                    window.enableTableNameIncrement();
                    let tbNM = TBFIXED;
                    tbNM = await generateTableName();
                    console.log(formData);
                    await storeSubmission(formData, tbNM);
                    FixedTB = false;
                    alert('Data submission completed successfully!');
                    document.getElementById('data-collection-form').reset();
                    $('.question-container div').html('');
                    setActiveLink(dataViewLink);
                    formContainer.classList.add('d-none');
                    dataViewContainer.classList.remove('d-none');
                    dataViewContainer.style.opacity = 0;
                    setTimeout(() => dataViewContainer.style.opacity = 1, 100);
                    await fetchAndDisplaySubmissions(); // Refresh the data view with new submissions
                } catch (error) {
                    console.error('Error storing form data in IndexedDB:', error.message);
                    console.error(error.stack);
                }
            });
        } else {
            console.error('Complete button not found.');
        }
    });
    // Function to serialize form data
    function serializeFormData() {
        const form = document.querySelector('#data-collection-form');
        const serializedData = {};
        const elements = form.querySelectorAll('input, select, textarea, [contenteditable="true"]');
        elements.forEach(element => {
            const name = element.id; // Use id for key
            const type = element.type;
            if (name != "secsInput" && name != "minsInput") {
                switch (type) {
                    case 'checkbox':
                        if (!serializedData[name]) {
                            serializedData[name] = [];
                        }
                        if (element.checked) {
                            serializedData[name].push(element.checked);
                        }
                        else {
                            serializedData[name].push(element.checked);
                        }
                        break;
                    case 'radio':
                        if (element.checked) {
                            serializedData[name] = element.checked;
                        } else {
                            serializedData[name] = element.checked;
                        }
                        break;
                    case 'select-one':
                    case 'select-multiple':
                        serializedData[name] = Array.from(element.selectedOptions).map(option => option.value);
                        break;
                    default:
                        if (element.getAttribute('contenteditable') === "true") {
                            serializedData[name] = element.innerHTML;
                        } else {
                            serializedData[name] = element.value;
                        }
                        break;
                }
            }
        });
        return serializedData;
    }
    //database adding
    const storeSubmission = async (Data, tbNM) => {
        try {
            const request2 = window.indexedDB.open('MineralDataDB', DBVersion);
            request2.onsuccess = (event) => {
                endTimer();
                const tableName = tbNM;
                const DateTime = new Date();
                let Timer = calculateElapsedTime(startTime, DateTime);
                const TEnable = document.getElementById("timer-toggle").checked;
                if (!TEnable) {
                    let MinValue = document.getElementById("minsInput").value;
                    MinValue = parseInt(MinValue == '' ? 0 : MinValue);
                    let SecValue = document.getElementById("secsInput").value;
                    SecValue = String(SecValue == '' ? 0 : SecValue);
                    if ((MinValue !== NaN && SecValue !== '') || (MinValue !== 0 && SecValue !== '0')) {
                        Timer = { minutes: LPad(String(MinValue), String(MinValue).length > 2 ? String(MinValue).length : 2), seconds: LPad(SecValue, 2) };
                    }

                }
                console.log("<<<>>>", TEnable, Timer);
                const userName = sessionStorage.getItem('user') || 'unknown';
                const userMail = sessionStorage.getItem('mail') || 'unknown@mail.com';
                if (!Data || Object.keys(Data).length === 0) {
                    console.error('No data provided for storage');
                    return;
                }
                const newItem = [{ DateTime, Timer: Timer, TEnable: TEnable, tableName, userName, userMail, Data: Data, },];
                console.log(newItem);
                db = request2.result;
                const transaction = db.transaction("submissions", 'readwrite');

                transaction.oncomplete = (event) => {
                    startTimer();
                };
                transaction.onerror = (event) => { console.error('Transaction error:', event.target.error); };
                const objectStore = transaction.objectStore("submissions");
                const objectStoreRequest = objectStore.add(newItem[0]);
                objectStoreRequest.onsuccess = (event) => {
                    console.log("Request successful.");
                    showFloatingAlert("Se agregaron los datos correctamente")
                };
            };
        } catch (error) {
            console.error('Error in storeSubmission:', error);
            console.error(error.stack);
        }
    };
    // edit data
    const editSubmissions = async (Data, tableName, IDtb) => {
        try {
            const request2 = window.indexedDB.open('MineralDataDB', DBVersion);
            request2.onsuccess = (event) => {
                const userName = sessionStorage.getItem('user') || 'unknown';
                const userMail = sessionStorage.getItem('mail') || 'unknown@mail.com';
                if (!Data || Object.keys(Data).length === 0) {
                    console.error('No data provided for storage');
                    return;
                }
                db = request2.result;

                const transaction = db.transaction("submissions", 'readwrite');
                transaction.oncomplete = (event) => {
                    startTimer();
                };
                transaction.onerror = (event) => { console.error('Transaction error:', event.target.error); };
                const objectStore = transaction.objectStore("submissions");
                const objectStoreRequest = objectStore.get(parseInt(IDtb));
                objectStoreRequest.onsuccess = (e) => {
                    const datas = e.target.result;
                    datas.DateTime = new Date();
                    datas.TEnable = timerEnabled;
                    datas.tableName = tableName;
                    datas.userName = userName;
                    datas.userMail = userMail;
                    datas.Data = Data;
                    const UpdateDatas = objectStore.put(datas)
                    UpdateDatas.onsuccess = () => {
                        console.log(`Actualizados ${IDtb}`);
                        showFloatingAlert(`Se editaron los datos correctamente para ID= ${IDtb}`);
                        setActiveLink(dataViewLink);
                        formContainer.classList.add('d-none');
                        dataViewContainer.classList.remove('d-none');
                        dataViewContainer.style.opacity = 0;
                        setTimeout(() => dataViewContainer.style.opacity = 1, 100);
                        fetchAndDisplaySubmissions();
                    };
                };
            };
        } catch (error) {
            console.error('Error in editSubmission:', error);
            console.error(error.stack);
        }
    };
    // Function to fetch and display submissions from IndexedDB
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
                    timerTd.textContent = `${LPad(submission.Timer.minutes, 2)}:${LPad(submission.Timer.seconds, 2)}`;
                    const dateTd = document.createElement('td');
                    dateTd.classList.add("smallTXT");
                    let dtS = new Date(submission.DateTime);
                    dateTd.textContent = dtS.getFullYear() + "/" + LPad(dtS.getMonth() + 1, 2) + "/" + LPad(dtS.getDate(), 2) + " " + LPad(dtS.getHours(), 2) + ":" + LPad(dtS.getMinutes(), 2) + ":" + LPad(dtS.getSeconds(), 2);
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
    //Borrar fila indexedBD
    window.deleteSubmission = async function (id) {
        const db = await dbPromise;
        const transaction = db.transaction('submissions', 'readwrite');
        const store = transaction.objectStore('submissions');
        store.delete(id);
        transaction.oncomplete = () => {
            console.log(`Submission ${id} deleted`);
            firstTimeFecth = 1;
            fetchAndDisplaySubmissions(); // Refresh the list
        };
        transaction.onerror = (event) => {
            console.error('Error deleting submission:', event.target.error);
        };
    };
    //Editar registro indexdedDB
    window.editSubmission = async function (id) {
        const db = await dbPromise;
        const transaction = db.transaction('submissions', 'readonly');
        const store = transaction.objectStore('submissions');
        const request = store.get(id);

        request.onsuccess = async (e) => {
            const submission = e.target.result;
            if (!submission) {
                console.error(`Submission with ID ${id} not found.`);
                return;
            }
            const formData = submission.Data;
            for (const key in formData) {
                const input = document.querySelector(`#${key}`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = formData[key][0];
                        input.checked = formData[key].includes(input.value == 'on');
                    } else if (input.type === 'radio') {
                        input.checked = formData[key];
                    } else if (input.getAttribute('contenteditable') === "true") {
                        input.innerHTML = formData[key];
                    } else {
                        input.value = formData[key];
                    }
                }
            }
            document.getElementById("secsInput").value = LPad(submission.Timer.seconds, submission.Timer.seconds.length > 2 ? submission.Timer.seconds.length : 2);
            document.getElementById("minsInput").value = LPad(submission.Timer.minutes, 2);
            setActiveLink(formLink);
            formContainer.classList.remove('d-none');
            dataViewContainer.classList.add('d-none');
            btnExportALL.classList.add('d-none');
            btnImport.classList.add('d-none');
            divEdit.classList.remove('d-none');
            divSub.classList.add('d-none');
            formContainer.style.opacity = 0;
            const BtnEdit = document.getElementById("form-edit");
            BtnEdit.setAttribute('IDtable', String(id));
            BtnEdit.setAttribute('tableName', String(submission.tableName));
            setTimeout(() => {
                formContainer.style.opacity = 1;
            }, 100);
            console.log(`Editing submission ${id}`);
        };
        request.onerror = (event) => {
            console.error('Error fetching submission for edit:', event.target.error);
        };
    };
    const LPad = (num, places) => String(num).padStart(places, '0');
    function continueTB(TBNAM) {
        FixedTB = true;
        TBFIXED = TBNAM;
        setActiveLink(formLink);
        formContainer.classList.remove('d-none');
        dataViewContainer.classList.add('d-none');
        btnExportALL.classList.add('d-none');
        formContainer.style.opacity = 0;
        setTimeout(() => {
            formContainer.style.opacity = 1;
        }, 100);
    }
});
//Eliminar columnas tablas HTML
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
//Span flotante
function showFloatingAlert(textc) {
    // Crear el elemento span si no existe
    let alertBox = document.getElementById('floatingAlert');
    if (!alertBox) {
        alertBox = document.createElement('span');
        alertBox.id = 'floatingAlert';
        alertBox.textContent = textc;
        document.body.appendChild(alertBox);
    }
    // Mostrar el mensaje con un fade in
    alertBox.style.opacity = 1;
    // Ocultar después de 4 segundos con un fade out
    setTimeout(() => {
        alertBox.style.opacity = 0;
        // Eliminar el elemento del DOM después de que desaparezca
        setTimeout(() => {
            alertBox.remove();
        }, 200);
    }, 4000);
}
