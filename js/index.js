$(document).ready(function () {
    $("#header").load("header.html");
    document.getElementById("ip").focus();
});



$("#submit-btn").click(function (event) {
    event.preventDefault();
    if (checkIP() && checkPORT() && checkProtocol() && checkPassword() && checkUsername()) {
        var url = $('select[name="protocol"]').val(); + "://" + $("#ip").val() + ":" + $("#port").val();
        fetch(url, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        console.log("true");
    } else {
        console.log("false")
    }

})
// submitBtn.addEventListener('click', (event) => {
//     event.preventDefault();
// var apiUrl = "http://125.227.161.91:8088/api/table.xml";
// var requestData = {
//     content: "devices",
//     columns: "objid,name",
//     username: "acom",
//     password: "Aa1234567890"
// }

// $.ajax({
//     url: apiUrl,
//     type: "GET",
//     data: requestData,
//     dataType: "xml",
//     success: function (response) {
//         // Handle XML response
//         console.log(response);

//         // Example: Parse XML and extract data
//         $(response).find("device").each(function () {
//             var objid = $(this).find("objid").text();
//             var name = $(this).find("name").text();

//             // Do something with objid and name
//             console.log("Device ID: " + objid + ", Name: " + name);
//         });
//     },
//     error: function (xhr, status, error) {
//         console.error("Error fetching data:", error);
//     }
// });
// })

function checkIP() {
    var ip = $("#ip").val();
    var reg_ip = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    var flag = false;
    if (reg_ip.test(ip)) {
        var parts = ip.split('.');
        for (var i = 0; i < parts.length; i++) {
            var num = parseInt(parts[i]);
            if (num > 0 && num < 255) {
                flag = true;
            }
        }
    }

    if (flag) {
        // valid
        $("#ip").css("border", "")
        $("#ip-error").text("OK!");
        $("#ip-error").css("color", "green");
        return flag;
    } else {
        // invalid
        $("#ip").css("border", "1px solid red")
        $("#ip-error").text("Invalid Value!");

        return flag;
    }
}

function checkPORT() {
    console.log()
    if (!isNaN(parseInt($("#port").val()))) {
        // valid
        $("#port").css("border", "")
        $("#port-error").text("OK!");
        $("#port-error").css("color", "green")
        return true;
    } else {
        // invalid
        $("#port").css("border", "1px solid red")
        $("#port-error").text("Invalid Value!");

        return false;
    }
}

function checkProtocol() {
    var selectedValue = $('select[name="protocol"]').val();
    if (selectedValue == "http" || selectedValue == "https") {
        return true;
    } else {
        return false;
    }
}

function checkUsername() {
    var username = $("#username").val();
    var reg_username = /^\w{4,20}$/;
    var flag = reg_username.test(username);
    if (flag) {
        // valid
        $("#username").css("border", "")
        $("#username-error").css("color", "green");
        $("#username-error").text("OK!");

        return flag;
    } else {
        // invalid
        $("#username").css("border", "1px solid red")
        $("#username-error").text("User Name invalid");

        return flag;
    }
}

function checkPassword() {
    var password = $("#password").val();
    var reg_password = /^\w{4,20}$/;
    var flag = reg_password.test(password);
    if (flag) {
        // valid
        $("#password").css("border", "")
        $("#password-error").css("color", "green");
        $("#password-error").text("OK!");

        return flag
    } else {
        // invalid
        $("#password").css("border", "1px solid red")
        $("#password-error").text("Password invalid");

        return flag
    }
}


$("#ip").blur(checkIP);
$("#port").blur(checkPORT);
$("#username").blur(checkUsername);
$("#password").blur(checkPassword);


// function isValidIPv4(value) {
//     var ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
//     if (!ipv4Regex.test(value)) {
//         return false;
//     }

//     var parts = value.split('.');
//     for (var i = 0; i < parts.length; i++) {
//         var num = parseInt(parts[i]);
//         if (isNaN(num) || num < 0 || num > 255) {
//             return false;
//         }
//     }

//     return true;
// }
