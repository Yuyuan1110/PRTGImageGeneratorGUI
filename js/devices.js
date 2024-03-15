$(function () {
    $("#header").load("header.html");
    getItem("devices", urlParams.get('groupid'));
    treeFunction();
    $(".datatimepicker").datetimepicker({
        timeFormat: "HH-mm",
        dateFormat: "yy-mm-dd",
    });
    submitFunciton();
    readXML();
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
        // event.preventDefault();
        // var selectedValues = [];
        var devices={}
        $(".devices:checked").each(function () {
            // selectedValues.push($(this).val());
            devices[$(this).val()]={deviceName:$(this).siblings("label").text()};
            var sensors = {}
            $(this).siblings().find('input.sensors:checked').each(function() {
                var sensorId = $(this).val();
                var sensorName = $(this).siblings("label").text();
                
                var channels = [];
                $(this).siblings('ul').find('input.channels:not(:checked)').each(function() {
                    channels.push($(this).val());
                });
                if (channels.length > 0) {
                    sensors[sensorId] = { sensorName: sensorName, channels: channels };
                }
            });
            devices[$(this).val()]["sensors"]=sensors;
        });
        sessionStorage.setItem("devices", JSON.stringify(devices));
        time={"startTime":$("#start").val(), "endTime":$("#end").val(), "interval":$("#avg").val()};
        sessionStorage.setItem("time", JSON.stringify(time));
        location.href = "download.html";
    });
}

function readXML(){
    $('#fileInput').on('change', function(event) {
        const file = event.target.files[0];

        if (!file) {
            console.error('No file selected.');
            return;
        }

        $("#inputFile").text(file.name);
        console.log(file.name);
        const reader = new FileReader();

        reader.onload = function(event) {
            const xmlContent = event.target.result;
            $('#output').text(xmlContent);
            // 在这里可以对xmlContent进行进一步处理，比如解析XML等操作
        };

        reader.onerror = function(event) {
            console.error('Error reading the file.', event.target.error);
        };

        // 以文本格式读取文件
        reader.readAsText(file);
    });
}
