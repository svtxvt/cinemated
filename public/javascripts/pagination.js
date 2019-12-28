let entity = document.getElementsByTagName('title')[0].textContent;
entity = entity.toLocaleLowerCase();
let search = document.getElementById("search");
if (search) {
   
    search.addEventListener("input", () => {
        Promise.all([
            fetch("/views/partials/dynamic.ejs").then(x => x.text()),
            fetch("/api/v1/" + entity + "?search=" + search.value).then(x => x.json()),
         ])
         .then(([templateStr, data]) => {
             const dataObject = {items: data.items, entity: entity, page: data.page, pages: data.pages};
             const html = ejs.render(templateStr, dataObject);
             const dynEl = document.getElementById('dynamic');
             dynEl.innerHTML = html;
         })
         .catch(err => console.error(err)); 
    });
}

const jwt = localStorage.getItem('jwt');
const reqOptions = {
    headers: { Authorization: `Bearer ${jwt}`, },
};

let current = document.getElementById("active");

function Trigger(button) {
   
    current.removeAttribute("id");
    button.id = "active";
    current = button;
    if(button.textContent === "1") {
        
        document.getElementById("prev").disabled = true;
        document.getElementById("next").disabled = false;
    }
    else if (button.textContent === document.getElementById("next").getAttribute("value")) {
       
        document.getElementById("next").disabled = true;
        document.getElementById("prev").disabled = false;
    }
    List(button.textContent);
}

function Next() {
    
    Trigger(current.nextElementSibling);
}

function Prev() {
    Trigger(current.previousElementSibling);
}

function List(page) {
    
    let promise;
    if (entity === "users") {
        promise = fetch("/api/v1/" + entity + "?page=" + page + "&search=" + search.value, reqOptions);    
    } else {       
        promise = fetch("/api/v1/" + entity + "?page=" + page + "&search=" + search.value);       
    }
   
    Promise.all([        
        fetch("/views/partials/list.ejs").then(x => x.text()),
        promise.then(x => x.json())
     ])
     .then(([templateStr, data]) => {        
         const dataObject = {items: data.items, entity: entity, page: data.page, pages: data.pages};
         const html = ejs.render(templateStr, dataObject);
         const listEl = document.getElementById('list');
         listEl.innerHTML = html;
     })
     .catch(err => console.error(err));     
}