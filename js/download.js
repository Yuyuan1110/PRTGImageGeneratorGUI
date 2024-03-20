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
        const fileHandle = await directoryHandle.getFileHandle(pngName + ".svg", { create: true });
        if (fileHandle) {
            const writable = await fileHandle.createWritable();
            await writable.write(url[pngName]);
            await writable.close();

            console.log('svg saved successfully.');
        } else {
            console.log("file Handle is null");
        }
    } catch (error) {
        console.error('Failed to save PNG:', error);
    }
}



$(document).on("click", "#chooseDir-btn", async () => {
    const directoryHandle = await requestFileSystemAccess();
    if (directoryHandle) {
        var urls = JSON.parse(sessionStorage.getItem("urls"));
        urls.map(async (url) => {
            // svgToImage(url);
            await savePng(directoryHandle, url);
        })
    }
})


$(document).on("click", "#API-btn", async () => {
    $("#API-btn").prop("disabled", true);
    var urls = await svgUrlGenerator();
    sessionStorage.setItem("urls", JSON.stringify(urls));
    $("#API-btn").prop("disabled", false);
})

async function svgUrlGenerator() {
    var urls = [];
    for (let deviceId of Object.keys(devices)) {
        const device = devices[deviceId];
        const deviceName = device.deviceName;

        for (let sensorId of Object.keys(device.sensors)) {
            const sensor = device.sensors[sensorId];
            const hide = sensor.channels;
            const u = url + "&id=" + sensorId + "&sdate=" + sdate + "&edate=" + edate + "&avg=" + avg + "&graphstyling=baseFontSize%3D%2710%27%20showLegend%3D%271%27&width=975&height=300&bgcolor=%23FCFCFC&hide=" + hide + "&username=" + info.username + "&password=" + info.password;
            var fileName = deviceName + sensor.sensorName;
            fileName = fileName.replace(/[\\/:*?"<>|]/g, '');
            fileName = fileName.trim().replace(/^\.+|\.+$/g, '')
            if (fileName.length > 255) {
                fileName = fileName.substring(0, 255);
            }

            try {
                const response = await fetch(u);
                const svgElement = await response.text();
                urls.push({ [fileName]: svgElement });
            } catch (error) {
                console.error('Failed to fetch SVG:', error);
            }
        }
    }
    return urls;
}


// function svgToImage(svgData) {
//     var pngName = Object.keys(url);
//     return new Promise((resolve, reject) => {
        
//         const img = new Image();
//         img.onload = () => resolve(img);
//         img.onerror = reject;
//         img.src = "data:image/svg+xml;base64," + btoa(svgData);
//     });
// }

// async function pngUrlGenerator(urls) {
//     await Promise.all(urls.map(async (url) => {
//         var keys = Object.keys(url);
//         // if need add "convert svg to png" feature in the future, add in this block.
//         fetch(url[keys])
//             .then(response => response.text())
//             .then(svgElement => {
//                 url = { [keys]: svgElement };
//             })
//             .catch(error => {
//                 console.error('Failed to fetch SVG:', error);
//             });
//     }))
//     return urls;
// }