'use strict'

const createBtn = document.querySelector('#create-btn');
const backBtn = document.querySelector('#back-btn');
let next;
initializeLatLong();

Array.prototype.slice.call(document.getElementsByClassName('form-control'))
    .forEach(x => {
        x.addEventListener('change', () => {
            x.classList.remove('is-invalid');
        });

    });

createBtn.addEventListener('click', () => {

    const name = document.querySelector('#name-input').value;
    const type = document.querySelector('#type-input').value;
    const country = document.querySelector('#country-input').value;
    const region = document.querySelector('#region-input').value;
    const lon = document.querySelector('#lon-input').value;
    const lat = document.querySelector('#lat-input').value;
    const description = document.querySelector('#description-input').value;

    const requestBody = {
        name: name,
        type: type,
        country: country,
        region: region,
        lon: lon,
        lat: lat,
        description: description
    }

    let status;

    fetch('http://localhost:3000/interests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth': 'pass'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            status = response.status;
            return response.json();
        })
        .then(response => {

            if (status === 200) window.location = `index.html`;

            if (status === 400)
                Object.keys(response).forEach(key => {
                    document.getElementById(`${key}-input`).classList.add('is-invalid');
                });

            createMessageDiv(status);
        });
});

function createMessageDiv(status) {

    let div = document.createElement('div');
    div.classList.add("alert-dismissible");
    div.classList.add("alert");
    div.id = "alert-message";

    if (status === 200) {
        div.classList.add("alert-success")
        div.innerHTML = 'Point of interest added successfully.'
    } else if (status === 400) {
        div.classList.add("alert-danger")
        div.innerHTML = `Can't create point of interest. Please check your input and try again.`
    } else if (status === 401) {
        div.classList.add("alert-danger")
        div.innerHTML = `Unauthorized`
    } else {
        div.classList.add("alert-danger")
        div.innerHTML = `Something unexpected happen.`
    }

    let messageDiv = document.getElementById('message');
    messageDiv.appendChild(div);

    // Automatically remove alert-message
    setTimeout(() => {
        document.getElementById('alert-message').remove();
    }, 5000)

}

function initializeLatLong() {
    const urlParams = new URLSearchParams(window.location.search);

    document.querySelector('#lat-input').value = urlParams.get('lat');
    document.querySelector('#lon-input').value = urlParams.get('lon');
    next = urlParams.get('next');
}

backBtn.addEventListener('click', () => redirectBack());

function redirectBack() {
    window.location = `../pages/index.html`;
}

