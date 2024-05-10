$(function () {
    $("#header").load("header.html");
    generator();
})

var info = JSON.parse(sessionStorage.getItem('info'));
var url = info.protocol + "://" + info.ip + ":" + info.port + "/chart.svg?graphid=-1";
var devices = JSON.parse(localStorage.getItem("devices"));
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
    // const directoryHandle = await requestFileSystemAccess();
    // if (directoryHandle) {
        // var urls = JSON.parse(localStorage.getItem("urls"));
        
        convertSVGs(downloadUrls);
    
        
            // svgToImage(url);
            // await savePng(directoryHandle, url);
    // }
})

var downloadUrls = []
async function generator(){
    downloadUrls = await svgUrlGenerator();
}

var textarea = $('#logTextarea');
async function svgUrlGenerator() {
    var urls = [];
    var logContent = 'Generating image, please wait....\n';
    for (let deviceId of Object.keys(devices)) {
        const device = devices[deviceId];
        const deviceName = device.deviceName;

        for (let sensorId of Object.keys(device.sensors)) {
            const sensor = device.sensors[sensorId];
            const hide = sensor.channels;
            const u = url + "&id=" + sensorId + "&sdate=" + sdate + "&edate=" + edate + "&avg=" + avg + "&graphstyling=baseFontSize%3D%2710%27%20showLegend%3D%271%27&width=975&height=300&bgcolor=%23FCFCFC&hide=" + hide + "&username=" + info.username + "&password=" + info.password;
            var fileName = deviceName +" - "+ sensor.sensorName;
            fileName = fileName.replace(/[\\/:*?"<>|]/g, '');
            fileName = fileName.trim().replace(/^\.+|\.+$/g, '')
            if (fileName.length > 255) {
                fileName = fileName.substring(0, 255);
            }

            try {
                const response = await fetch(u);
                const svgElement = await response.text();
                logContent += "Generated image: " + fileName +".jpg \n";
                urls.push({ [fileName]: svgElement });
            } catch (error) {
                console.error('Failed to fetch SVG:', error);
            }
            $("#logTextarea").val(logContent);
            
            textarea.scrollTop(textarea[0].scrollHeight);
        }
    } 
    logContent += "All images have been generated!!!\n";
    logContent += "Please press Download button!!"
    $("#logTextarea").val(logContent);
    textarea.scrollTop(textarea[0].scrollHeight);
    $("#chooseDir-btn").prop("disabled", false);
    return urls;
}


async function convertSVGs(urls) {
    $("#chooseDir-btn").prop("disabled", true);
    $("#chooseDir-btn").text("waiting");
    var jpgFiles = []; // 儲存所有轉换後的 JPG 文件
    var promises = [];
    urls.map(svgData => {
        
        var jpgName = Object.keys(svgData);
        var img = new Image();
        
        var promise = new Promise((resolve, reject) => {
            img.onload = function(){
                var canvas = document.createElement('canvas');
                canvas.width = 975;
                canvas.height = 300;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, 975, 300);
                canvas.toBlob(blob => {
                    jpgFiles.push({ blob, name: jpgName + '.jpg' });
                    resolve();
                }, 'image/jpeg');
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData[jpgName]))); // 设置图片的 src
        });
        promises.push(promise); // 将每个图片加载操作的 Promise 存入数组
    });
    Promise.all(promises).then(() => {
    saveFilesToFolder(jpgFiles);
    });
}
async function saveFilesToFolder(jpgFiles) {
    try {
      // 請求用户選擇文件夾
      const folderHandle = await window.showDirectoryPicker();
      
      // 保存所有 JPG 文件到用户選擇的文件夾中
      for (const jpgFile of jpgFiles) {
        const fileHandle = await folderHandle.getFileHandle(jpgFile.name, { create: true });
        await writeFile(fileHandle, jpgFile.blob);
      }
      
      alert('Files saved successfully!');
    } catch (err) {
      console.error('Error saving files:', err);
      alert('Error saving files: ' + err.message);
    }
    $("#chooseDir-btn").prop("disabled", false);
    $("#chooseDir-btn").text("Download");
  }
  
  // 寫入文件
  async function writeFile(fileHandle, blob) {
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
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
