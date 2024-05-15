// Assuming existence of a function that can append to a local CSV file

function registerUser() {
    // Get values from form inputs
    var username = document.getElementById('signup-username').value;
    var firstName = document.getElementById('firstname').value;
    var lastName = document.getElementById('lastname').value;
    var email = document.getElementById('signup-email').value;
    var data = document.getElementById('signup-password').value;
    var data2 = document.getElementById('signup-password2').value;

    // Perform validations
    if (!validateEmail(email)) {
        alert('Introduzca una dirección de correo electrónico válida.');
        return;
    }

    if (!validateName(firstName) || !validateName(lastName)) {
        alert('Los nombres y apellidos sólo deben contener letras.');
        return;
    }
    if (data!==data2) {
        alert('Las verificacion de constraseña no coincide.');
        return;
    }
    if (!validatePassword(data)||!validatePassword(data2)) {
        alert('La contraseña debe tener más de 8 caracteres y no contener caracteres en blanco.');
        return;
    }


    // Base64 encode the values
    var encodedUsername = btoa(username);
    var encodedFirstName = btoa(firstName);
    var encodedLastName = btoa(lastName);
    var encodedEmail = btoa(email);
    var encodeddata = btoa(data);
    var encodeddata2 = btoa(data2);
    var union=null;
    union=atob(Sam1());
    if (union==null) {
        alert("No existe el archivo de verificaicon Samples.lml")
        return;
    }
    // console.log("completo",union.split("\n"));
    var lista=union.split("\n").slice(0,-1);
    var userRow = `${encodedUsername}|${encodedFirstName}|${encodedLastName}|${encodedEmail}|${encodeddata}\n`;
    var existe=0;
    for (let index = 0; index < lista.length; index++) {
        let spfila=lista[index].replace("\n").split("|");
        let sprow=userRow.replace("\n").split("|");
        if(spfila[0]===sprow[0]){existe=1;alert("Nick Nombre ya existe");}
        if(spfila[3]===sprow[3]){existe=1;alert("Correo ya usado ya existe");}
    }
    if(existe==1){
        return;
    }
    // console.log("old==",lista)
    let total=lista.concat(userRow.split("\n").slice(0,-1));
    // Create the new user row for the CSV and append it
    // This function needs actual implementation
    // console.log("array:",total);
    // console.log("texto",`${total.join("\n")}\n`);
    appendToCSV("base64:",btoa(`${total.join("\n")}\n`)); // This function needs actual implementation
}

// Validation for email using regular expression
function validateEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validation for names to ensure they contain only letters
function validateName(name) {
    var regex = /^[a-zA-Z_]+( [a-zA-Z_]+)*$/;
    return regex.test(name);
}

// Validation for password to ensure it's longer than 8 characters and contains no spaces
function validatePassword(password) {
    var regex = /^[^\s]{8,}$/; // This regex matches any sequence of characters except spaces that are 8 characters or longer
    return regex.test(password);
}
function downloadBlob(content, filename, contentType) {
    // Create a blob
    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);
  
    // Create a link to download it
    var pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', filename);
    pom.click();
  }
// Placeholder function to append data to CSV (this needs actual implementation)
function appendToCSV(txt,row) {
    console.log(txt,row);
    let alltxt=`function Sam1(){\r\n    var sm="${row}";\r\nreturn sm;}`
    // Actual implementation needed
    downloadBlob(alltxt, 'Samples.lml', 'text/csv;charset=utf-8;')
    setTimeout(() => {
        console.log("final");
      }, 5000);
      setTimeout(() => {
        alert("recargue la pagina para porder ingresar")
      }, 5000);
      window.location.href = window.location.href.split('#')[0];
}

document.getElementById('signup-button').onclick = registerUser;
