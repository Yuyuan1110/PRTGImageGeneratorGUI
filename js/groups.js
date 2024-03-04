$(document).ready(function () {
    $("#header").load("header.html");
    $(".tree").html(buildHtml(tree));
    treeFunction();
});


var info = JSON.parse(sessionStorage.getItem('info'));
var groups = JSON.parse(sessionStorage.getItem('groups'));
var probenodes = JSON.parse(sessionStorage.getItem('probenodes'));
console.log(groups);


function treeFunction() {
    $('.toggle').click(function () {
        $(this).parent().children("ul").toggle("active");
        $(this).toggleClass("toggle-down");
    });
}

function sortProbeodes(probenodes) {
    var sorted = Object.values(probenodes);
    sorted.sort(function (a, b) {
        a.parentid.localeCompare(b.parentid);
    });
    sorted.map(function (item) {
        return { name: item.name, age: item.age };
    });

}
var tree = buildTree(groups, probenodes);
function buildTree(groups, probenodes) {
    var tree = [];
    probenodes.forEach(function (probe) {
        groups.forEach(function (item) {
            if (item.parentid === probe.objid) {
                var children = buildTree(groups, [item]);
                if (children.length > 0) {
                    item.children = children;
                }
                tree.push(item);
            }
        });
    });

    return tree;
}



function buildHtml(tree) {
    var html = '<ul>';
    tree.forEach(function (item) {
        html += '<li>';
        if (item.children) {
            html += '<span class="toggle"></span><label>' + item.name + '</label>';
            html += buildHtml(item.children);
        } else {
            html += item.name;
        }
        html += '</li>';
    });
    html += '</ul>';
    return html;
}


