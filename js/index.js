$(document).ready(function () {
    $("#header").load("header.html");
});

const dropdownMenu = document.querySelector('.dropdown-menu');
dropdownMenu.addEventListener('click', function (event) {
    if (event.target.classList.contains('dropdown-item')) {
        const selectedValue = event.target.innerText;
        document.querySelector('.dropdown-toggle').innerText = selectedValue;
    }
});

const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', function (event) {
    fetch('http://125.227.161.91:8088/api/table.xml?content=devices&columns=objid,name&username=acom&password=Aa1234567890', {
        mode: 'cors'
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error(error));
})

