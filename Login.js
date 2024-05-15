function loginUser() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    // Base64 encode the inputs for comparison
    var encodedUsername = btoa(username);
    var encodedData = btoa(password);
    // console.log(encodedUsername,encodedData);
    var entro=0;
    // Assume a function to read the CSV and find the user by encoded credentials
    findUserInCSV(encodedUsername, encodedData, function(isValid, userNameALLoc,UserMailALLoc) {
        if (isValid) {
            // Assuming user was found, set cookie and sessionStorage
            entro=1;
            const date = new Date();
            // Establecer la expiración en días
            const Ndias=1;
            date.setTime(date.getTime() + (Ndias * 24 * 60 * 60 * 1000));
            // date.setTime(date.getTime() + (Ndias * 30 * 1000));
            let expires = "expires=" + date.toUTCString();
            document.cookie = "user=" + userNameALLoc + ";mail="+UserMailALLoc+";"+ expires +";path=Recoleccion/index.html";
            sessionStorage.setItem("user", userNameALLoc);
            sessionStorage.setItem("mail", UserMailALLoc);
            sessionStorage.setItem("expires", date);
            // console.log(date);
            // alert(`ingreso ${userNameALLoc} ${UserMailALLoc}`);
            // Redirect to the data entry page
            window.location.href = "Recoleccion/index.html";
            return;
        } else {
            if(entro===0){ 
            alert("Credenciales incorrectas (si acabo de crear su usuario actualice la pagina)");
            setTimeout(() => {
                alert("recargue la pagina para porder ingresar")
              }, 5000);
              window.location.href = window.location.href.split('#')[0];
            }
        }
    });
}

// Dummy function to find user in CSV
function findUserInCSV(encodedUsername, encodedPassword, callback) {
    // Actual CSV reading and validation needed
    // Callback parameters: isValid (boolean), userId (if valid)
    union=atob(Sam1());
    if (union==null) {
        alert("No existe el archivo de verificaicon Samples.lml")
        return;
    }
    // console.log("completo",union.split("\n"));
    var lista=union.split("\n").slice(0,-1);
    // console.log("Appending to CSV: ", union);
    // console.log("Appending to CSV: ", lista);
    var datos="";
    for (let index = 0; index < lista.length; index++) {
        const separados = lista[index].split("|");
        if((atob(separados[0]).toLowerCase()===atob(encodedUsername).toLowerCase()||atob(separados[3]).toLowerCase()===atob(encodedUsername).toLowerCase())&&separados[4]===encodedPassword){
            callback(true,atob(separados[0]),atob(separados[3]).toLowerCase());
        }        
    }
    callback(false, null,null); // Placeholder for failure
}

document.getElementById('login-button').onclick = loginUser;