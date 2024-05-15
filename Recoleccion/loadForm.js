document.addEventListener('DOMContentLoaded', () => {
    // Embedding the JSON data directly due to CORS policy restrictions with local files
    const formData = [
        {
            "question": "PROJECT:",
            "type": "clickableDiv",
            "id": "PROJECT",
            "pattern":"^.{2,}$"
        },
        {
            "question": "CODIGO TERRENO:",
            "type": "clickableDiv",
            "id": "cod-terreno",
            "pattern":"\\S+-\\S"
        },
        {
            "question": "SECTOR:",
            "type": "clickableDiv",
            "id": "sector-data",
            "pattern":"^.{3,}$"
        },
        {
            "question": "LOM SEC:",
            "type": "clickableDiv",
            "id": "lom-sec",
            "pattern":"^.{3,}$"
        },
        {
            "question": "PSI:",
            "type": "clickableDiv",
            "id": "PSI",
            "pattern":"^\\d+$"
        },
        {
            "question": "HOLE CODE:",
            "type": "clickableDiv",
            "id": "hole-code",
            "pattern":"^\\d+$"
        },
        {
            "question": "SAMPLE:",
            "type": "clickableDiv",
            "id": "sample-data",
            "pattern":"^\\d+$"
        },
        {
            "question": "DEPTH_FROM:",
            "type": "clickableDiv",
            "id": "depth-from",
            "pattern":"^\\d+,\\d+$"
        },
        {
            "question": "LITHOLOGY_1",
            "type": "dropdown",
            "options": ["CHUS","ARCI","SULP","CALH","CALC","CALS","RIPI","GRAV","NSR"],
            "id": "lithology_1",
            "pattern":""
        },
        {
            "question": "LITHOLOGY_2",
            "type": "dropdown",
            "options": ["CHUS","ARCI","SULP","CALH","CALC","CALS","RIPI","GRAV","NSR"],
            "id": "lithology_2",
            "pattern":""
        },
        {
            "question": "Additional notes:",
            "type": "clickableDiv2",
            "id": "additional-notes",
            "pattern":""
        }
    ];

    createForm(formData);

    function createForm(questions) {
        const formContainer = document.getElementById('form-container');
        if (!formContainer) {
            console.error('Form container not found in the document.');
            return;
        }
        const form = document.createElement('form');
        form.id = 'data-collection-form';

        // Adding a toggle switch for starting the timer
        const timerToggleContainer = document.createElement('div');
        timerToggleContainer.classList.add('form-group');
        const timerToggle = document.createElement('input');
        timerToggle.type = 'checkbox';
        timerToggle.id = 'timer-toggle';
        timerToggle.classList.add('form-check-input');
        const timerToggleLabel = document.createElement('label');
        timerToggleLabel.setAttribute('for', 'timer-toggle');
        timerToggleLabel.id='label-timer-chk';
        timerToggleLabel.textContent = 'Start Timer';
        timerToggleLabel.classList.add('form-check-label');
        timerToggleContainer.appendChild(timerToggle);
        timerToggleContainer.appendChild(timerToggleLabel);
        
        const inputmin =document.createElement("input");
        const inputsec =document.createElement("input");
        
        inputmin.classList.add('clickable-div');
        inputmin.classList.add('timerin');
        inputmin.type="text";
        inputmin.id="minsInput";
        inputmin.setAttribute("placeholder","MMs");
        inputsec.classList.add('clickable-div');
        inputsec.classList.add('timerin');
        inputsec.id="secsInput";
        inputsec.type="text";
        inputsec.setAttribute("placeholder","SS");
        timerToggleContainer.appendChild(inputmin);
        padd=document.createElement('span');
        padd.innerText=":";
        padd.id="span2p";
        timerToggleContainer.appendChild(padd);
        timerToggleContainer.appendChild(inputsec);
        form.appendChild(timerToggleContainer);

        timerToggle.addEventListener('change', () => {
            const event = new CustomEvent('timerToggle', { detail: { start: timerToggle.checked } });
            document.dispatchEvent(event);
        });

        questions.forEach((question, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container', 'mb-3');
            const questionLabel = document.createElement('label');
            questionLabel.id="LBL_"+question.id
            questionLabel.textContent = question.question;
            questionLabel.htmlFor=question.id;
            questionContainer.appendChild(questionLabel);

            switch (question.type) {
                case 'dropdown':
                    const span=document.createElement('span')
                    span.classList.add("custom-dropdown")
                    span.classList.add("big")
                    span.classList.add("box")
                    const select = document.createElement('select');
                    span.appendChild(select)
                    select.classList.add('form-control');
                    select.id = question.id;
                    question.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.textContent = option;
                        optionElement.value = option;
                        select.appendChild(optionElement);
                    });
                    questionContainer.appendChild(span);
                    break;
                case 'checkbox':
                    question.options.forEach(option => {
                        const checkboxContainer = document.createElement('div');
                        checkboxContainer.classList.add('form-check');
                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        input.classList.add('form-check-input');
                        input.id = `${question.id}-${option}`;
                        input.name = question.id;
                        const label = document.createElement('label');
                        label.classList.add('form-check-label');
                        label.setAttribute('for', `${question.id}-${option}`);
                        label.textContent = option;
                        checkboxContainer.appendChild(input);
                        checkboxContainer.appendChild(label);
                        questionContainer.appendChild(checkboxContainer);
                    });
                    break;
                case 'radio':
                    question.options.forEach((option, idx) => {
                        const radioContainer = document.createElement('div');
                        radioContainer.classList.add('form-check');
                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.name = question.id;
                        input.classList.add('form-check-input');
                        input.id = `${question.id}-${idx}`;
                        const label = document.createElement('label');
                        label.classList.add('form-check-label');
                        label.setAttribute('for', `${question.id}-${idx}`);
                        label.textContent = option;
                        radioContainer.appendChild(input);
                        radioContainer.appendChild(label);
                        questionContainer.appendChild(radioContainer);
                    });
                    break;
                case 'clickableDiv2':
                    const div = document.createElement('div');
                    div.classList.add('clickable-div');
                    div.setAttribute('contenteditable', true);
                    div.setAttribute('Pattern', question.pattern);
                    div.id = question.id;
                    div.setAttribute("name", question.id);
                    div.style.border = '1px solid #ccc';
                    div.style.padding = '10px';
                    div.style.minHeight = '100px';
                    div.style.maxWidth = '250px';
                    div.style.minWidth = '200px';
                    questionContainer.appendChild(div);
                    break;
                case 'clickableDiv':
                    const div2= document.createElement('div');
                    div2.classList.add('clickable-div');
                    div2.setAttribute('contenteditable', true);
                    div2.setAttribute('Pattern', question.pattern);
                    div2.id = question.id;
                    if(question.id=="PROJECT"){
                        div2.textContent="AB";
                    }
                    div2.setAttribute("name", question.id);
                    div2.style.border = '1px solid #ccc';
                    div2.style.padding = '10px';
                    div2.style.minHeight = '10px';
                    div2.style.maxWidth = '250px';
                    div2.style.minWidth = '100px';
                    div2.style.backgroundColor="white";
                    questionContainer.appendChild(div2);
                    break;
                default:
                    console.error('Unsupported question type:', question.type);
            }

            // Transition effect for questionContainer
            questionContainer.style.opacity = 0;
            setTimeout(() => questionContainer.style.opacity = 1, 100);
            form.appendChild(questionContainer);
        });

        // Adding a submit button at the end of the form
        const divbtnsSubmit=document.getElementById("submit-container");
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.id = 'form-submit';
        submitButton.textContent = 'Subir';
        submitButton.classList.add('btn', 'btn-primary');
        divbtnsSubmit.appendChild(submitButton);
        

        // Adding an end button to finalize the data entry session
        const endButton = document.createElement('button');
        endButton.type = 'button';
        endButton.id = 'end-submission';
        endButton.textContent = 'Fin Tabla';
        endButton.classList.add('btn', 'btn-secondary', 'ml-2');
        divbtnsSubmit.appendChild(endButton);
        form.appendChild(divbtnsSubmit);
        //editar
        const divbtnEditar=document.getElementById("edit-container");
        divbtnEditar.classList.add("d-none")
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.id = 'form-edit';
        editButton.textContent = 'Subir Edicion';
        editButton.classList.add('btn', 'btn-primary');
        divbtnEditar.appendChild(editButton);
        form.appendChild(divbtnEditar);

        endButton.addEventListener('click', () => {
            const event = new CustomEvent('submissionComplete');
            document.dispatchEvent(event);
            console.log('Submission process ended by the user.');
        });
        editButton.addEventListener('click', () => {
            const event = new CustomEvent('submissionEDIT');
            document.dispatchEvent(event);
            console.log('Edicion.');
        });
        
        formContainer.appendChild(form);
        const elements = document.querySelectorAll('#form-container div[contenteditable="true"]');
        elements.forEach(element => {
            element.addEventListener('blur', function() {
                console.log(this.id,this.getAttribute("pattern"));
                validateContent(this.id,this.getAttribute("pattern"));
            });
        });
        function validateContent(IDact,pttact) {
            const objectDIV=document.getElementById(IDact);
            if(pttact.includes(",")){
                objectDIV.textContent=objectDIV.textContent.replace(".",",")
            }
            const text = objectDIV.textContent;
            const Patternto = new RegExp(pttact); // Patrón simple para validar email
            const isValid = Patternto.test(text);
            if (!isValid) {
                objectDIV.style.borderColor = 'red';
            } else {
                objectDIV.style.borderColor = 'green';
            }
            return isValid;
        }
        const elemdrop1 = document.getElementById('lithology_1');
        const elemdrop2 = document.getElementById('lithology_2');
        elemdrop1.addEventListener('blur', function() {
            updateDIV2(elemdrop1.id,elemdrop2.id);
        });
        elemdrop2.addEventListener('blur', function() {
            updateDIV2(elemdrop1.id,elemdrop2.id);
        });
        function updateDIV2(ID1,ID2) {
            const drop1 = document.getElementById(ID1);
            const drop2 = document.getElementById(ID2);
            if(drop2.options[drop2.selectedIndex].text!=drop1.options[drop1.selectedIndex].text){
                document.getElementById("additional-notes").textContent="Some of "+drop2.options[drop2.selectedIndex].text;
            }
            else{
                document.getElementById("additional-notes").textContent="";
            }
        }
        $('#lithology_1').on('change', function(){
            updateDIV2(elemdrop1.id,elemdrop2.id);
        });
        $('#lithology_2').on('change', function(){
            updateDIV2(elemdrop1.id,elemdrop2.id);
        });
        // Dispatching a custom event 'formLoaded' to signal that the form has been loaded and is ready
        const formLoadedEvent = new CustomEvent('formLoaded');
        document.dispatchEvent(formLoadedEvent);
    }
});