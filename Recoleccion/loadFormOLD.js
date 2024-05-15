document.addEventListener('DOMContentLoaded', () => {
    // Embedding the JSON data directly due to CORS policy restrictions with local files
    const formData = [
        {
            "question": "What is your favorite mineral?",
            "type": "dropdown",
            "options": ["Quartz", "Feldspar", "Calcite"],
            "id": "favorite-mineral"
        },
        {
            "question": "Select the minerals you have worked with:",
            "type": "checkbox",
            "options": ["Gypsum", "Halite", "Magnetite"],
            "id": "worked-minerals"
        },
        {
            "question": "Preferred mining method:",
            "type": "radio",
            "options": ["Surface mining", "Underground mining"],
            "id": "mining-method"
        },
        {
            "question": "Additional notes:",
            "type": "clickableDiv",
            "id": "additional-notes"
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
        form.appendChild(timerToggleContainer);

        timerToggle.addEventListener('change', () => {
            const event = new CustomEvent('timerToggle', { detail: { start: timerToggle.checked } });
            document.dispatchEvent(event);
        });

        questions.forEach((question, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container', 'mb-3');
            const questionLabel = document.createElement('label');
            questionLabel.textContent = question.question;
            questionContainer.appendChild(questionLabel);

            switch (question.type) {
                case 'dropdown':
                    const select = document.createElement('select');
                    select.classList.add('form-control');
                    select.id = question.id;
                    question.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.textContent = option;
                        optionElement.value = option;
                        select.appendChild(optionElement);
                    });
                    questionContainer.appendChild(select);
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
                case 'clickableDiv':
                    const div = document.createElement('div');
                    div.classList.add('clickable-div');
                    div.setAttribute('contenteditable', true);
                    div.id = question.id;
                    div.style.border = '1px solid #ccc';
                    div.style.padding = '10px';
                    div.style.minHeight = '100px';
                    questionContainer.appendChild(div);
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
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.id = 'form-submit';
        submitButton.textContent = 'Submit';
        submitButton.classList.add('btn', 'btn-primary');
        form.appendChild(submitButton);

        // Adding an end button to finalize the data entry session
        const endButton = document.createElement('button');
        endButton.type = 'button';
        endButton.id = 'end-submission';
        endButton.textContent = 'End Submission';
        endButton.classList.add('btn', 'btn-secondary', 'ml-2');
        form.appendChild(endButton);

        endButton.addEventListener('click', () => {
            const event = new CustomEvent('submissionComplete');
            document.dispatchEvent(event);
            console.log('Submission process ended by the user.');
        });

        formContainer.appendChild(form);

        // Dispatching a custom event 'formLoaded' to signal that the form has been loaded and is ready
        const formLoadedEvent = new CustomEvent('formLoaded');
        document.dispatchEvent(formLoadedEvent);
    }
});