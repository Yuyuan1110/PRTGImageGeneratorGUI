$(document).ready(function () {
    $("#header").load("header.html");
    getItem("devices", urlParams.get('groupid'));
    treeFunction();
});

var urlParams = new URLSearchParams(window.location.search);
var info = JSON.parse(sessionStorage.getItem('info'));
var url = info.protocol + "://" + info.ip + ":" + info.port + "/api/table.json";

var checkDevicesId = [];
var checkSensorsId = [];

function treeFunction() {
    $(document).on('click', '.toggle', function () {
        switch ($(this).attr("name")) {
            case "devices":
                var deviceId = $(this).attr('value');
                if (checkDevicesId.includes(deviceId)) {
                    $(this).parent().children("ul").toggle("active");
                    $(this).toggleClass("toggle-down");
                } else {
                    $(this).parent().children("ul").toggle("active");
                    $(this).toggleClass("toggle-down");
                    getItem("sensors", deviceId);
                    checkDevicesId.push(deviceId);
                }
                break;
            case "sensors":
                var sensorsId = $(this).attr("value");
                if (checkSensorsId.includes(sensorsId)) {
                    $(this).parent().children("ul").toggle("active");
                    $(this).toggleClass("toggle-down");
                } else {
                    $(this).parent().children("ul").toggle("active");
                    $(this).toggleClass("toggle-down");
                    getItem("channels", sensorsId);
                    checkSensorsId.push(sensorsId);
                }
                break;
        }
    });
}

function getItem(element, id) {
    var RequestData = {
        content: element,
        columns: "objid,name",
        id: id,
        username: info.username,
        password: info.password
    };
    $.ajax({
        url: url,
        type: "GET",
        data: RequestData,
        dataType: "json",
        success: function (response) {
            switch (element) {
                case "devices":
                    $("#devices").html(buildHtml(element, response.devices));
                    break;
                case "sensors":
                    $("input[value=" + id + "]").parent().children("ul").html(buildHtml(element, response.sensors));
                    break;
                case "channels":
                    $("input[value=" + id + "]").parent().children("ul").html(buildHtml(element, response.channels));
                    break;
            }
        }
    });
}

function buildHtml(element, items) {
    var html = "";
    items.forEach(item => {
        switch (element) {
            case "devices":
                html += '<div class="col-4"><ul id=' + item.objid + '><li><input class="toggle" type="checkbox" name="devices" value="' + item.objid + '">' + item.name + '</input><ul><li>Waiting...(沒東西的話重勾選一下...)</li></ul></li></ul></div>';
                break;
            case "sensors":
                html += '<li><input class="toggle" type="checkbox" name="sensors" value="' + item.objid + '">' + item.name + '</input><ul><li>沒資訊就等一下再重勾一次</li></ul></li>';
                break;
            case "channels":
                html += '<li><input type="checkbox" name="channels" value="' + item.objid + '">' + item.name + '</input></li>';
                break;
        }
    })
    return html;
}

var fso = new ActiveXObject("Scripting.FileSystemObject");
var f1 = fso.CreateTextFile("")