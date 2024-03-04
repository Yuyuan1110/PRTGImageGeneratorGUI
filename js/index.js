$(document).ready(function () {
    $("#header").load("header.html");
    document.getElementById("ip").focus();
    $(".spinner-border").css("display", "none");

});

var info = { ip: "", port: "", protocol: "", username: "", password: "" };

$("#submit-btn").click(function (event) {
    event.preventDefault();
    if (checkIP() && checkPORT() && checkProtocol() && checkPassword() && checkUsername()) {
        $(".spinner-border").css("display", "");
        $("#submit-btn").prop("disabled", true);
        $("#connect-error").text('Connecting to server...')
        var url = info.protocol + "://" + info.ip + ":" + info.port + "/api/table.json";
        var groupsRequestData = {
            content: "groups",
            columns: "objid,name,parentid",
            username: info.username,
            password: info.password
        }
        var probeNodesRequestData = {
            content: "probenodes",
            columns: "objid,name,parentid",
            username: info.username,
            password: info.password
        }
        $.ajax({
            url: url,
            type: "GET",
            data: groupsRequestData,
            dataType: "json",
            success: function (response) {
                $(".spinner-border").css("display", "none");
                $("#connect-error").text("forwarding to next page.");
                $("#connect-error").css("color", "green");
                sessionStorage.setItem("info", JSON.stringify(info));
                // console.log(response.groups);
                sessionStorage.setItem("groups", JSON.stringify(response.groups));
                // location.href = "groups.html"
            },
            error: function (xhr, status, error) {
                // console.error("Error fetching data:", error);
                switch (xhr.status) {
                    case 401:
                        $(".spinner-border").css("display", "none");
                        $("#connect-error").text("Unauthorized.")
                        break;
                    case 500:
                        $(".spinner-border").css("display", "none");
                        $("#connect-error").text("Internal server error.")
                        break;
                    default:
                        $(".spinner-border").css("display", "none");
                        $("#connect-error").text("Can't connected to server, please try again.")
                        break;
                }
                $("#submit-btn").prop("disabled", false);
            }
        });

        $.ajax({
            url: url,
            type: "GET",
            data: probeNodesRequestData,
            dataType: "json",
            success: function (response) {
                // $(".spinner-border").css("display", "none");
                // $("#connect-error").text("forwarding to next page.");
                // $("#connect-error").css("color", "green");
                // sessionStorage.setItem("info", JSON.stringify(info));
                console.log(response.probenodes.filter(function (item) {
                    return item.parentid === 0;
                }));
                sessionStorage.setItem("probenodes", JSON.stringify(response.probenodes.filter(function (item) {
                    return item.parentid === 0;
                })));
                location.href = "groups.html";
            }
        });
    } else {
        switch (false) {
            case checkIP():
                $("#ip").focus();
                break;
            case checkPORT():
                $("#port").focus();
                break;
            case checkUsername():
                $("#username").focus();
                break;
            case checkPassword():
                $("#password").focus();
                break;
            case checkProtocol():
                $("#protocol").focus();
                break;
        }
    }
});


function checkIP() {
    var ip = $("#ip").val();
    var reg_ip = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    var flag = false;
    if (reg_ip.test(ip)) {
        var parts = ip.split('.');
        for (var i = 0; i < parts.length; i++) {
            var num = parseInt(parts[i]);
            if (num >= 0 && num < 256) {
                flag = true;
            } else {
                flag = false;
                break;
            }
        }
    }

    if (flag) {
        // valid
        $("#ip").css("border", "")
        $("#ip-error").text("OK!");
        $("#ip-error").css("color", "green");
        info.ip = ip;

        return flag;
    } else {
        // invalid
        $("#ip").css("border", "1px solid red")
        $("#ip-error").text("Invalid Value!");
        $("#ip-error").css("color", "red");

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
        info.port = $("#port").val();

        return true;
    } else {
        // invalid
        $("#port").css("border", "1px solid red")
        $("#port-error").text("Invalid Value!");
        $("#port-error").css("color", "red");

        return false;
    }
}

function checkProtocol() {
    var selectedValue = $('select[name="protocol"]').val();
    if (selectedValue == "http" || selectedValue == "https") {
        // valid
        $("#protocol-error").text("OK!");
        $("#protocol-error").css("color", "green");
        info.protocol = selectedValue;

        return true;
    } else {
        // invalid
        $("#protocol-error").text("Please select an option.");
        $("#protocol-error").css("color", "red");

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
        info.username = username;

        return flag;
    } else {
        // invalid
        $("#username").css("border", "1px solid red")
        $("#username-error").text("User Name invalid");
        $("#username-error").css("color", "red");

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
        info.password = password;

        return flag
    } else {
        // invalid
        $("#password").css("border", "1px solid red")
        $("#password-error").text("Password invalid");
        $("#password-error").css("color", "red");

        return flag
    }
}

$("#ip").blur(checkIP);
$("#port").blur(checkPORT);
$('select[name="protocol"]').blur(checkProtocol);
$("#username").blur(checkUsername);
$("#password").blur(checkPassword);