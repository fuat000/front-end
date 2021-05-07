
const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', () => {

    const username = document.querySelector('#username-input').value;
    const password = document.querySelector('#password-input').value;

    let status;

    fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    })
        .then(response => {
            console.log(response);
            status = response.status;
            return response.json();
        })
        .then(response => {
            console.log(response);


            if (status === 200) {
                window.localStorage.setItem('user', response.session.username);
                window.location = `./index.html`;
                document.cookie = `name=${response.sessionID}; expires=${response.session.cookie.expires}; path=${response.session.cookie.path}; domain=${response.domain};`

            }

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
