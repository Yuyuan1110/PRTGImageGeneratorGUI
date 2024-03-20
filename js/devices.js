$(function () {
    $("#header").load("header.html");
    getItem("devices", urlParams.get('groupid'));
    readXML();
    treeFunction();
    $(".datatimepicker").datetimepicker({
        timeFormat: "HH-mm",
        dateFormat: "yy-mm-dd",
    });
    submitFunciton();
});

var urlParams = new URLSearchParams(window.location.search);
var info = JSON.parse(sessionStorage.getItem('info'));
var url = info.protocol + "://" + info.ip + ":" + info.port + "/api/table.json";

var checkId = [];
function treeFunction() {
    $(document).on('change', '.toggle', function () {
        switch ($(this).attr("name")) {
            case "devices":
                var deviceId = $(this).attr('value');
                if ($(this).prop("checked")) {
                    if (checkId.includes(deviceId)) {
                        $(this).parent().children("ul").show("active");
                        // $(this).toggleClass("toggle-down");
                    } else {
                        $(this).parent().children("ul").show("active");
                        // $(this).toggleClass("toggle-down");
                        getItem("sensors", deviceId);
                        checkId.push(deviceId);
                    }
                    break;
                } else {
                    $(this).parent().children("ul").hide("active");
                    break;
                }

            case "sensors":
                var sensorsId = $(this).attr("value");
                if ($(this).prop("checked")) {
                    if (checkId.includes(sensorsId)) {
                        $(this).parent().children("ul").toggle("active");
                        // $(this).toggleClass("toggle-down");
                    } else {
                        $(this).parent().children("ul").toggle("active");
                        // $(this).toggleClass("toggle-down");
                        getItem("channels", sensorsId);
                        checkId.push(sensorsId);
                    }
                    break;
                } else {
                    $(this).parent().children("ul").hide("active");
                    break;
                }
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
                html += '<div class="col-4"><ul id=' + item.objid + '><li><input class="toggle devices" type="checkbox" name="devices" value="' + item.objid + '"><label>' + item.name + '</label></input><ul><li>Waiting...(沒東西的話重勾選一下...)</li></ul></li></ul></div>';
                break;
            case "sensors":
                html += '<li><input class="toggle sensors" type="checkbox" name="sensors" value="' + item.objid + '"><label>' + item.name + '</label></input><ul><li>沒資訊就等一下再重勾一次</li></ul></li>';
                break;
            case "channels":
                html += '<li><input class="channels" type="checkbox" name="channels" value="' + item.objid + '">' + item.name + '</input></li>';
                break;
        }
    })
    return html;
}

function submitFunciton() {
    $(document).on("click", "#submit-btn", function (event) {
        var devices = {}
        $(".devices:checked").each(function () {
            devices[$(this).val()] = { deviceName: $(this).siblings("label").text() };
            var sensors = {}
            $(this).siblings().find('input.sensors:checked').each(function () {
                var sensorId = $(this).val();
                var sensorName = $(this).siblings("label").text();

                var channels = [];
                $(this).siblings('ul').find('input.channels:not(:checked)').each(function () {
                    channels.push($(this).val());
                });
                if (channels.length > 0) {
                    sensors[sensorId] = { sensorName: sensorName, channels: channels };
                }
            });
            devices[$(this).val()]["sensors"] = sensors;
        });
        sessionStorage.setItem("devices", JSON.stringify(devices));
        time = { "startTime": $("#start").val(), "endTime": $("#end").val(), "interval": $("#avg").val() };
        sessionStorage.setItem("time", JSON.stringify(time));
        location.href = "download.html";
    });
}

function readXML() {
    $(document).on('change', '#fileInput', function (event) {

        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        $("#inputFile").text(file.name);
        console.log(file.name);
        const reader = new FileReader();
        reader.onload = function (event) {
            const xmlContent = event.target.result;
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            var devices = xmlDoc.getElementsByTagName("device");

            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];
                var deviceID = device.querySelector("deviceID").textContent;
                getItem("sensors", deviceID);
                checkId.push(deviceID);
            }

            var sensors = xmlDoc.getElementsByTagName("sensor");
            for (var j = 0; j < sensors.length; j++) {
                var sensor = sensors[j];
                var sensorID = sensor.querySelector("sensorID").textContent;
                var channels = sensor.querySelector("channel");
                for (var i =0; i < channels.length; i++){

                }
                getItem("channels", sensorID);
                checkId.push(sensorID);
            }


            checkId.forEach(id =>{
                NodeChecked(id);
            })
        };

        reader.onerror = function (event) {
            console.error('Error reading the file.', event.target.error);
        };

        reader.readAsText(file);
    });
}

function NodeChecked(id) {
    $("input[value=" + id + "]").prop("checked", true);
    $("input[value=" + id + "]").trigger("change");
}


