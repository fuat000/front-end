'use strict'


const searchBtn = document.querySelector('#search-btn');
const viewBtn = document.querySelector('#view-btn');

let pointsOfInterests = [];
let lastSearch;

if(window.localStorage.user) document.querySelector('#loggedin').textContent = `Logged in as: ${window.localStorage.user}`

initializeRegion();

decideView() // Initialize view

searchBtn.addEventListener('click', () => search());

// Change view functionality
viewBtn.addEventListener('click', () => {
    const toRemove = viewBtn.classList.contains('table-view') ? 'table-view' : 'map-view';
    const toAdd = toRemove === 'table-view' ? 'map-view' : 'table-view';

    viewBtn.classList.remove(toRemove);
    viewBtn.classList.add(toAdd);

    search();
});

function search() {
    let region = document.querySelector('#search-input').value;
    region = !region ? lastSearch : region;
    lastSearch = region;
    fetch(`http://localhost:3000/interests?region=${region}`)
        .then(response => response.json())
        .then(body => {
            pointsOfInterests = body;
            decideView();

        }, err => {
            alert(`An error has occured ${err.message}`)
        });
}

function decideView(body = undefined) {
    body = body ? body : pointsOfInterests;
    if(viewBtn.classList.contains('table-view')) {
        viewBtn.textContent = 'MAP VIEW'
        createTable(body)
    }
    else if(viewBtn.classList.contains('map-view')) {
        viewBtn.textContent = 'TABLE VIEW'
        mapView();
    }
}

function mapView() {

    clearPreviousView();

    const displayContainer = document.getElementById('display-container');

    const mapContainer = document.createElement('div');
    mapContainer.id = 'mapid';

    displayContainer.appendChild(mapContainer);

    const map = L.map ("mapid");

    const attrib="Map data copyright OpenStreetMap contributors, Open Database Licence";

    L.tileLayer
    ("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: attrib } ).addTo(map);


    for (var i = 0; i < pointsOfInterests.length; i++) {
        const pos = [pointsOfInterests[i].lat, pointsOfInterests[i].lon];
        var marker = L.marker(pos).addTo(map);
        const review = document.createElement('div');
        review.id = 'review-container';

        const input = document.createElement('input');
        input.id = 'review-input';
        input.name = `review-${pointsOfInterests[i].ID}`
        input.classList.add('form-control');
        review.appendChild(input);

        const button = document.createElement('button');
        button.id = 'review-create';
        button.textContent = 'CREATE';
        button.classList.add('btn');
        button.classList.add('action-button');
        button.classList.add('btn-primary');
        button.classList.add('float-right');
        button.addEventListener('click', () => {

            const revText = document.querySelector('#review-input');
            const poiID = revText.name.split('-')[1]; 

            const reqBody = {
                review: revText.textContent,
                poiID: poiID
            }

            console.log(reqBody);

            fetch('http://localhost:3000/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth': 'pass'
                },
                body: JSON.stringify(reqBody)
            })
                .then(response => {
                    status = response.status;
                    return response.json();
                })
                .then(response => {

                    if (status === 400)
                        Object.keys(response).forEach(key => {
                            document.getElementById(`${key}-input`).classList.add('is-invalid');
                        });
                    console.log(status);
                    createMessageDiv(status);
                });
        });

        review.appendChild(button);

        marker.bindPopup(review); // add the DOM-created div to a marker
  
    }

    const pos = [50.908, -1.4];
    map.setView(pos, 14);

    map.on('click', function(e) {
        window.location = `./point-of-interest-create.html?lat=${e.latlng.lat}&lon=${e.latlng.lng}&next=${lastSearch ? lastSearch : ''}`;
    });
}

function clearPreviousView() {
    const wrapper = document.getElementById('table-wrapper');
    const mapContainer = document.getElementById('mapid');

    if (mapContainer) mapContainer.remove();
    if (wrapper) wrapper.remove();
}

function createTable(data) {

    clearPreviousView();

    const displayContainer = document.getElementById('display-container');

    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-responsive');
    tableWrapper.id = 'table-wrapper';
    displayContainer.appendChild(tableWrapper)

    const tableFixedHead = document.createElement('div');
    tableFixedHead.classList.add('tableFixHead')
    tableWrapper.appendChild(tableFixedHead);

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordred', 'table-striped');

    let tableHead = document.createElement('thead');

    [
        'ID',
        'Name',
        'Type',
        'Country',
        'Region',
        'Longitude',
        'Latitude',
        'Description',
        'Recommendations',
        'Actions'
    ].forEach(th => {
        let header = document.createElement('th');
        header.innerHTML = th;
        tableHead.appendChild(header);
    });

    table.appendChild(tableHead);

    let tableBody = document.createElement('tbody');

    if (!data) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.appendChild(document.createTextNode('No data found.'))
        tr.appendChild(td);
        tableBody.appendChild(tr);
    }

    if (data) data.forEach(point => {
        let tr = document.createElement('tr');

        Object.keys(point).forEach(key => {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(point[`${key}`] === null ? '-' : point[`${key}`]));
            tr.appendChild(td)
        });

        let td = document.createElement('td');
        let btn = document.createElement('button');
        btn.id = `recommend-${point.ID}`;
        btn.classList.add('btn');
        btn.classList.add('btn-primary');

        btn.textContent = 'RECOMMEND';
        td.appendChild(btn);
        tr.appendChild(td);

        btn.addEventListener('click', () => {
            fetch(`http://localhost:3000/interests/${point.ID}`, {
                method: 'PATCH',
                headers: {
                    'auth': 'pass'
                }
            }).then(response => {
                search(lastSearch);
            })
        });

        tableBody.appendChild(tr);
    });

    table.appendChild(tableBody);
    tableFixedHead.appendChild(table);
    displayContainer.appendChild(tableWrapper);
}

function initializeRegion() {
    const urlParams = new URLSearchParams(window.location.search);
    document.querySelector('#search-input').value = urlParams.get('region');
    search();
}

function createMessageDiv(status) {

    let div = document.createElement('div');
    div.classList.add("alert-dismissible");
    div.classList.add("alert");
    div.id = "alert-message";
    if (status === 200 || status === '200') {
        div.classList.add("alert-success")
        div.innerHTML = 'Review Created Sucessfully'
    } else if (status === 400 || status === '400') {
        div.classList.add("alert-danger")
        div.innerHTML = `Can't create point of review. Please check your input and try again.`
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
