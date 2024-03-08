$(function () {
    $("#header").load("header.html");

})

var info = JSON.parse(sessionStorage.getItem('info'));
var url = info.protocol + "://" + info.ip + ":" + info.port + "/chart.svg?graphid=-1";
var devices = JSON.parse(sessionStorage.getItem("devices"));
var time = JSON.parse(sessionStorage.getItem("time"));
const sdate = time.startTime.replace(/\s/g, "-").replace(/(:|$)/g, "-00");
const edate = time.endTime.replace(/\s/g, "-").replace(/(:|$)/g, "-00");
const avg = time.interval;


async function requestFileSystemAccess() {
    try {
        const directoryHandle = await window.showDirectoryPicker();
        return directoryHandle;
    } catch (error) {
        console.error('Failed to request file system access:', error);
    }
}

async function savePng(directoryHandle, url) {
    var pngName = Object.keys(url);
    try {
        console.log(url);
        const fileHandle = await directoryHandle.getFileHandle(pngName + ".png", { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(url[pngName]);
        await writable.close();

        console.log('PNG saved successfully.');
    } catch (error) {
        console.error('Failed to save PNG:', error);
    }
}

$(document).on("click", "#chooseDir-btn", async () => {
    const directoryHandle = await requestFileSystemAccess();
    if (directoryHandle) {
        var urls = pngUrlGenerator(svgUrlGenerator());
        urls.forEach(url => {

            savePng(directoryHandle, url);
        })
    }
})


function svgUrlGenerator() {
    var urls = [];
    Object.keys(devices).forEach(deviceId => {
        const device = devices[deviceId];
        const deviceName = device.deviceName;
        Object.keys(device.sensors).forEach(sensorId => {
            const sensor = device.sensors[sensorId];
            const hide = sensor.channels;
            const u = url + "&id=" + sensorId + "&sdate=" + sdate + "&edate=" + edate + "&avg=" + avg + "&graphstyling=baseFontSize%3D%2710%27%20showLegend%3D%271%27&width=975&height=300&bgcolor=%23FCFCFC&hide=" + hide + "&username=" + info.username + "&password=" + info.password;
            var fileName = deviceName + sensor.sensorName;
            fileName = fileName.replace(/[\\/:*?"<>|]/g, '');
            fileName = fileName.trim().replace(/^\.+|\.+$/g, '')
            if (fileName.length > 255) {
                fileName = fileName.substring(0, 255);
            }
            urls.push({ [fileName]: u });
        })
    })
    return urls;
}

function pngUrlGenerator(urls) {
    urls.forEach(url => {
        var keys = Object.keys(url);
        // Step 1: Fetch the SVG file
        fetch(url[keys])
            .then(response => response.text())
            .then(svgElement => {
                svgData = new XMLSerializer().serializeToString(svgElement);
                //將svg資料序列話成 string
                let canvas = document.createElement("canvas");
                //會了 把svg轉成png的 canvas
                let ctx = canvas.getContext("2d");

                let img = new Image();
                // (btoa 把 string to base64)
                img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Step 4: Convert canvas to PNG data URL
                    const pngDataUrl = canvas.toDataURL('image/png');
                    urls[keys] = pngDataUrl;
                }
            })
            .catch(error => {
                console.error('Failed to fetch SVG:', error);
            });
    })
    return urls;
}
