$(document).ready(function () {
    $("#header").load("header.html");
    $(".tree").html(buildHtml(tree));
    treeFunction();
});

var info = JSON.parse(sessionStorage.getItem('info'));
var groups = JSON.parse(sessionStorage.getItem('groups'));
var probenodes = JSON.parse(sessionStorage.getItem('probenodes'));
var merged = probenodes.concat(groups);


function treeFunction() {
    $('.toggle').click(function () {
        $(this).parent().children("ul").toggle("active");
        $(this).toggleClass("toggle-down");
    });
}

var tree = buildTree(merged, -1000);
function buildTree(merged, parentid) {
    var tree = [];
    merged.forEach(function (item) {
        if (item.parentid === parentid) {
            var children = buildTree(merged, item.objid);
            if (children.length > 0) {
                item.children = children;
            }
            tree.push(item);
        }
    });
    return tree;
}

function buildHtml(tree) {
    var html = '<ul>';
    tree.forEach(function (item) {
        html += '<li>';
        if (item.children) {
            html += '<span class="toggle"></span><a href="devices.html?groupid=' + encodeURIComponent(item.objid) + '">' + item.name + '</a>';
            html += buildHtml(item.children);
        } else {
            html += '<a href="devices.html?groupid=' + encodeURIComponent(item.objid) + '">' + item.name + '</a>';
        }
        html += '</li>';
    });
    html += '</ul>';
    return html;
}


