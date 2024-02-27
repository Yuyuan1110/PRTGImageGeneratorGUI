$(document).ready(function () {
    $("#header").load("header.html");
    tree_generator();
});
var info = JSON.parse(sessionStorage.getItem('info'));
var groups = JSON.parse(sessionStorage.getItem('groups'));
function tree_generator(){
    console.log()
    // $("#probe-row").html("<label>"+JSON.stringify(info)+"</label>")
}