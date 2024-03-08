$(function () {
    $("#header").load("header.html");
    getItem("devices", urlParams.get('groupid'));
    treeFunction();
    $(".datatimepicker").datetimepicker({
        timeFormat: "HH-mm",
        dateFormat: "yy-mm-dd",
    });
    submitFunciton()
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

// async function test() {
//     // 请求用户授权访问文件系统
//     async function requestFileSystemAccess() {
//         try {
//             const directoryHandle = await window.showDirectoryPicker();
//             return directoryHandle;
//         } catch (error) {
//             console.error('Failed to request file system access:', error);
//         }
//     }

//     // 创建文件夹
//     async function createDirectory(directoryHandle, directoryName) {
//         try {
//             await directoryHandle.getDirectoryHandle(directoryName, { create: true });
//             console.log('Directory successfully created.');
//         } catch (error) {
//             console.error('Failed to create directory:', error);
//         }
//     }

//     // 当用户点击按钮时触发创建文件夹操作
//     document.getElementById('requestAccessButton').addEventListener('click', async () => {
//         const directoryHandle = await requestFileSystemAccess();
//         if (directoryHandle) {
//             const directoryName = 'NewFolder';
//             await createDirectory(directoryHandle, directoryName);
//         }
//     });
// }


