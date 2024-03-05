$(document).ready(function () {
    $("#header").load("header.html");
    $("#devices").html(buildDevicesHtml(devices));
    treeFunction();
});

var urlParams = new URLSearchParams(window.location.search);
var info = JSON.parse(sessionStorage.getItem('info'));
var groupId = urlParams.get('groupid');
var url = info.protocol + "://" + info.ip + ":" + info.port + "/api/table.json";
var devicesRequestData = {
    content: "devices",
    columns: "objid,name",
    id: groupId,
    username: info.username,
    password: info.password
};
function treeFunction() {
    $('.toggle').click(function () {
        $(this).parent().children("ul").toggle("active");
        $(this).toggleClass("toggle-down");
        var parentid = $(this).parent().parent().attr('id');
        getSensors(parentid);
    });
}

$.ajax({
    url: url,
    type: "GET",
    data: devicesRequestData,
    dataType: "json",
    success: function (response) {
        sessionStorage.setItem("devices", JSON.stringify(response.devices));
    }
});

var devices = JSON.parse(sessionStorage.getItem('devices'));
// console.log(devices);
function buildDevicesHtml(devices) {
    var html ="";
    devices.forEach(function(element){
        html += '<div class="col-4"><ul id='+element.objid+'><li><span class="toggle">'+ element.name +'</span><ul><li>fff</li></ul></li></ul></div>';
    });
    // var html = '<ul>';
    // tree.forEach(function (item) {
    //     html += '<li>';
    //     if (item.children) {
    //         html += '<span class="toggle"></span><a href="devices.html?groupid=' + encodeURIComponent(item.objid) + '">' + item.name + '</a>';
    //         html += buildHtml(item.children);
    //     } else {
    //         html += '<a href="devices.html?groupid=' + encodeURIComponent(item.objid) + '">' + item.name + '</a>';
    //     }
    //     html += '</li>';
    // });
    // html += '</ul>';

    return html;
}



function getSensors(id){
    var sensors = [];
    var sensorsRequestData = {
        content: "sensors",
        columns: "objid,name",
        id: id,
        username: info.username,
        password: info.password
    };
    $.ajax({
        url: url,
        type: "GET",
        data: sensorsRequestData,
        dataType: "json",
        success: function (response) {
            sessionStorage.setItem("sensors", JSON.stringify(response.sensors));
            sensor=response.sensors;
            console.log(sensor);
        }
    });
}
function buildSensorsHtml(){

}