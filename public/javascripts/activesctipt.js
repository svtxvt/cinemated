for (var i = 0; i < document.links.length; i++) {
    if (document.links[i].href == document.URL) {
        document.links[i].className = 'nav-link  active';
    } else {document.links[0].className = 'nav-link active';}
}
