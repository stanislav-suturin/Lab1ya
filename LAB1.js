function httpGet(theUrl) {
    console.log("httpGet(" + theUrl + ")");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function rootPath() {
    jsonString = httpGet("/?ls");
    json = JSON.parse(jsonString);
    createExplorerFromJSON(json);
}

function createExplorerFromJSON(json) {
    var pathParagraph = document.createElement("p");
    var queryParagraph = document.createElement("p");
    var errorParagraph = document.createElement("p");
    var table = document.createElement("table");
    var fileContent = document.createElement("p");
    var resultDirs;
    var currentPath;

    for (var key in json) {
        switch (key) {
            case 'path':
                console.log(key + ':' + json[key]);
                pathParagraph.textContent = json[key];
                currentPath = json[key];
                break;
            case 'query':
                console.log(key + ':' + json[key]);
                queryParagraph.textContent = json[key];
                break;
            case 'error':
                console.log(key + ':' + json[key]);
                errorParagraph.textContent = json[key];
                break;
            case 'result':
                console.log(key + ':' + json[key]);
                resultDirs = json[key];
                break;
            default:
                console.log(key + ':' + json[key]);
                break;
        }
    }

    if (currentPath != "/") {
        var folders = currentPath.split("/");
        console.log("Folders: " + folders);

        var tr = table.insertRow(-1);
        var tabCell = tr.insertCell(-1);
        var pathA = document.createElement("a");
        var len = folders.length;
        var topPath = folders.slice(0, len - 1).join("/");
        var lsLink = topPath + "?ls";
        pathA.setAttribute('href', 'javascript:void(0)');
        pathA.addEventListener("click", function () {
            console.log(lsLink);
            jsonString = httpGet(lsLink);
            json = JSON.parse(jsonString);
            createExplorerFromJSON(json);
        }, false);
        pathA.textContent = "..";
        tabCell.appendChild(pathA);

        if (!currentPath.endsWith('/')) {
            currentPath += '/'
        }
    }

    for (var i = 0; i < resultDirs.length; i++) {
        var tr = table.insertRow(-1);

        var tabCell = tr.insertCell(-1);
        var pathA = document.createElement("a");
        pathA.setAttribute('href', 'javascript:void(0)');
        pathA.addEventListener("click", function (e) {
            var currentLsLink = e.target.innerText;
            var lsLink = currentPath + currentLsLink + "?ls"
            jsonString = httpGet(lsLink);
            json = JSON.parse(jsonString);
            if (typeof json['result'] === 'undefined') {
                var downloadLink = currentPath + currentLsLink + "?download"
                fileContent.textContent = httpGet(downloadLink);
            } else {
                createExplorerFromJSON(json);
            }

        }, false);
        pathA.textContent = resultDirs[i];
        tabCell.appendChild(pathA);

        var rmdirCell = tr.insertCell(-1);
        var deleteA = document.createElement("a");
        deleteA.setAttribute('href', 'javascript:void(0)');
        deleteA.addEventListener("click", function (e) {
            console.log()
            var currentRmdirLink = e.target.parentElement.parentElement.children[0].children[0].innerText
            var dir = resultDirs[i]
            var rmdirLink = currentPath + currentRmdirLink + "/?rmdir";
            console.log(rmdirLink);
            httpGet(rmdirLink);

            jsonString = httpGet(currentPath + "?ls");
            json = JSON.parse(jsonString);
            createExplorerFromJSON(json);
        }, false);
        deleteA.textContent = "x";
        rmdirCell.appendChild(deleteA);
    }

    var divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    divContainer.appendChild(pathParagraph);
    divContainer.appendChild(queryParagraph);
    divContainer.appendChild(errorParagraph);
    divContainer.appendChild(table);

    var dirNameTextField = document.createElement("input");
    dirNameTextField.setAttribute('type', 'text');
    dirNameTextField.setAttribute('id', 'dirNameTextField');
    divContainer.appendChild(dirNameTextField)

    var mkdirParagraph = document.createElement("p");
    var mkdirButton = document.createElement("input");
    mkdirButton.setAttribute('type', 'button');
    mkdirButton.setAttribute('value', 'Make New Dir');
    var createDirHandler = function () {
        return function () {
            var dirName = document.getElementById('dirNameTextField').value;
            httpGet(currentPath + dirName + "?mkdir");
            jsonString = httpGet(currentPath + "?ls");
            json = JSON.parse(jsonString);
            createExplorerFromJSON(json);
        };
    };
    mkdirButton.onclick = createDirHandler();
    mkdirParagraph.appendChild(mkdirButton);
    divContainer.appendChild(mkdirParagraph);

    divContainer.appendChild(fileContent);
}

rootPath();