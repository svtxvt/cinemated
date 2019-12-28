let update = document.getElementById('update');
let del = document.getElementById('delete');

window.onclick = function(event) {
    if (event.target == update) {
        update.style.display = "none";
    }
    else if (event.target == del) {
        del.style.display = "none";
    }
}