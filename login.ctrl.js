
const loginBtn = document.querySelector('#login-btn');

setCookie('ppkcookie','testcookie',7);

var x = getCookie('ppkcookie');


loginBtn.addEventListener('click', () => {

    const username = document.querySelector('#username-input').value;
    const password = document.querySelector('#password-input').value;

    let status;

    fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        credentials: 'include', // Don't forget to specify this if you need cookies
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    })
        .then(response => {
            console.log();
            status = response.status;
            return response.json();
        })
        .then(response => {

            console.log(response);
            // window.sessionStorage.setItem('session', response);

            // if (status === 200) window.location = `./index.html`;

            if(status === 400) Object.keys(response).forEach(key => {
                document.getElementById(`${key}-input`).classList.add('is-invalid');
            });

            if(status === 500) createMessageDiv(false);

            if(status === 200) createMessageDiv(true);
        });

});

function createMessageDiv(success) {

    let div = document.createElement('div');
    div.classList.add("alert-dismissible");
    div.classList.add("alert");
    div.id = "alert-message";

    if (success) {
        div.classList.add("alert-success")
        div.innerHTML = 'Login successful'
    } else {
        div.classList.add("alert-danger")
        div.innerHTML = `Wrong username or password.`
    }

    let messageDiv = document.getElementById('message');
    messageDiv.appendChild(div);

    // Automatically remove alert-message
    setTimeout(() => {
        document.getElementById('alert-message').remove();
    }, 2000)

}


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}