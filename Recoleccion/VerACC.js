  window.addEventListener('DOMContentLoaded', (event) => {
    function datosEnSessionStorage() {
      return sessionStorage.getItem('user') !== null && sessionStorage.getItem('mail') !== null;
    }
    function datosEnCookies() {
      // document.cookie es una cadena de texto con todas las cookies, separadas por ';'
      // Esta función busca dentro de esa cadena las claves específicas que podrían indicar datos relevantes
      return document.cookie.split(';').some(cookie => cookie.trim().startsWith('user=') && cookie.trim().startsWith('mail='));
    }
    // Verificar si hay datos de usuario en sessionStorage o en cookies
    if (!datosEnSessionStorage() && !datosEnCookies()) {
      // Si no hay datos, primero limpiar sessionStorage y cookies
      sessionStorage.clear(); // Limpia todo el sessionStorage
      // Limpia todas las cookies
      document.cookie.split(';').forEach(function(c) {document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';});
      // Mostrar alerta al usuario
      alert('Debe registrarse o ingresar desde la página de inicio.');
      // Redireccionar a login.html
      window.location.href = '../Index.html';
    }
  });

const nmin = 10;
setInterval(() => {
  let expires = sessionStorage.getItem("expires");
  if (expires) {
    const now = new Date();
    const expiresDate = new Date(expires);
    if (now > expiresDate) {
      sessionStorage.clear();
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      });
      alert("Sesión vencida. Inicie sesión nuevamente...");
      window.location.href = '../Index.html';
    }
  }
}, nmin * 60000);