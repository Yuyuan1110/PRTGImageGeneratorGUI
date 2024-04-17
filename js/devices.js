$(function () {
    $("#header").load("header.html");
    getItem("devices", urlParams.get('groupid'));
    readXML();
    treeFunction();
    $(".datatimepicker").datetimepicker({
        timeFormat: "HH-mm",
        dateFormat: "yy-mm-dd",
    });

    exportXML();
    submitFunciton();
});

var urlParams = new URLSearchParams(window.location.search);
var info = JSON.parse(sessionStorage.getItem('info'));
var url = info.protocol + "://" + info.ip + ":" + info.port + "/api/table.json";

var checkedDeviceId = [];
var checkedSensorId = [];
function treeFunction() {
    $(document).on('change', '.toggle', function () {
        switch ($(this).attr("name")) {
            case "devices":
                var deviceId = $(this).attr('value');
                if ($(this).prop("checked")) {
                    if (checkedDeviceId.includes(deviceId)) {
                        $(this).parent().children("ul").show("active");
                        // $(this).toggleClass("toggle-down");
                    } else {
                        $(this).parent().children("ul").show("active");
                        // $(this).toggleClass("toggle-down");
                        getItem("sensors", deviceId);
                        checkedDeviceId.push(deviceId);
                    }
                    break;
                } else {
                    $(this).parent().children("ul").hide("active");
                    break;
                }

            case "sensors":
                var sensorsId = $(this).attr("value");
                if ($(this).prop("checked")) {
                    if (checkedSensorId.includes(sensorsId)) {
                        $(this).parent().children("ul").toggle("active");
                        // $(this).toggleClass("toggle-down");
                    } else {
                        $(this).parent().children("ul").toggle("active");
                        // $(this).toggleClass("toggle-down");
                        getItem("channels", sensorsId);
                        checkedSensorId.push(sensorsId);
                    }
                    break;
                } else {
                    $(this).parent().children("ul").hide("active");
                    break;
                }
        }
    });
}

async function getItem(element, id) {
    getUrl = url + "?content=" + element + "&columns=objid,name&id=" + id + "&username=" + info.username + "&password=" + info.password;

    try {
        var response = await fetch(getUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        switch (element) {
            case "devices":
                $("#devices").html(buildHtml(element, data.devices));
                break;
            case "sensors":
                $("input[value=" + id + "]").parent().children("ul").html(buildHtml(element, data.sensors));
                break;
            case "channels":
                $("input[value=" + id + "]").parent().children("ul").html(buildHtml(element, data.channels));
                return data.channels;
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
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
                html += '<li><input class="channels" type="checkbox" name="channels" value="' + item.objid + '"><label>' + item.name + '</label></input></li>';
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
        localStorage.setItem("devices", JSON.stringify(devices));
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
        reader.onload = async function (event) {
            const xmlContent = event.target.result;
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            var devices = xmlDoc.getElementsByTagName("device");

            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];
                var deviceID = device.querySelector("deviceID").textContent;
                getItem("sensors", deviceID);
                checkedDeviceId.push(deviceID);
                NodeChecked(deviceID);
            }

            var sensors = xmlDoc.getElementsByTagName("sensor");
            for (var j = 0; j < sensors.length; j++) {
                var sensor = sensors[j];
                var sensorID = sensor.querySelector("sensorID").textContent;
                console.log(sensorID);
                var allChannelsOfSensor = await getItem("channels", sensorID);
                checkedSensorId.push(sensorID);
                NodeChecked(sensorID);
                var channels = sensor.querySelectorAll("channel");
                var allChannelsID = allChannelsOfSensor.map(function (obj) {
                    return obj.objid;
                })

                channels.forEach(channel => {
                    channelID = channel.querySelector("channelID").textContent;
                    index = allChannelsID.indexOf(parseInt(channelID));
                    if (index !== -1) {
                        allChannelsID.splice(index, 1);
                    }
                })

                allChannelsID.forEach(id => {
                    $("input[value=" + id + "]").prop("checked", true);
                })
            }
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

function exportXML() {
    $(document).on("click", "#fileOutput", event => {

        var xmlDoc = document.implementation.createDocument(null, "devices");
        var root = xmlDoc.documentElement;

        $(".devices:checked").each(function () {
            var device = xmlDoc.createElement("device");
            var deviceName = xmlDoc.createElement("deviceName");
            deviceName.textContent = $(this).siblings("label").text();
            var deviceID = xmlDoc.createElement("deviceID");
            deviceID.textContent = $(this).val();
            device.appendChild(deviceName);
            device.appendChild(deviceID);
            sensors = xmlDoc.createElement("sensors");
            $(this).siblings().find('input.sensors:checked').each(function () {
                var sensor = xmlDoc.createElement("sensor");
                var sensorName = xmlDoc.createElement("sensorName");
                sensorName.textContent = $(this).siblings("label").text();
                var sensorID = xmlDoc.createElement("sensorID");
                sensorID.textContent = $(this).val();
                sensor.appendChild(sensorName);
                sensor.appendChild(sensorID);
                channels = xmlDoc.createElement("channels");
                $(this).siblings('ul').find('input.channels:not(:checked)').each(function () {
                    var channel = xmlDoc.createElement("channel");
                    var channelName = xmlDoc.createElement("channelName");
                    channelName.textContent = $(this).siblings("label").text();
                    var channelID = xmlDoc.createElement("channelID");
                    channelID.textContent = $(this).val();
                    channel.appendChild(channelName);
                    channel.appendChild(channelID);
                    channels.appendChild(channel);
                });
                sensor.appendChild(channels);
                sensors.appendChild(sensor);
            })
            device.appendChild(sensors);
            root.appendChild(device);
        })
        var xmlDeclaration = xmlDoc.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8" standalone="no"');
        xmlDoc.insertBefore(xmlDeclaration, xmlDoc.firstChild);
        var xmlString = new XMLSerializer().serializeToString(xmlDoc);

        var blob = new Blob([xmlString], { type: 'text/xml' });

        // 创建一个链接
        var url = URL.createObjectURL(blob);

        // 创建一个 <a> 元素
        var a = document.createElement('a');
        a.href = url;
        a.download = 'settings.xml'; // 下载文件的名称

        // 模拟点击下载链接
        document.body.appendChild(a);
        a.click();

        // 清除临时 URL 对象
        window.URL.revokeObjectURL(url);
    });
}
