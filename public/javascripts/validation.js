let form = document.getElementById("form");
let fullname = document.getElementById("fullname");
let username = document.getElementById("username");
let password = document.getElementById("password");
// const user = require('./models/user');
let repassword = document.getElementById("repassword");


form.addEventListener('submit', (e) => {
    if (fullname.value.length > 50 || username.value.length > 50 || password.value.length > 50) {
        e.preventDefault();
        form.reset();
        let message = document.getElementById("alert");
            message.style.display = "block";
            message.textContent = "Too long data";
    }
    else if (fullname.value === "" || username.value === "") {
        e.preventDefault();
        form.reset();
        let message = document.getElementById("alert");
            message.style.display = "block";
            message.textContent = "Please fill all fields";
    }
});


form.addEventListener("input", function(event) {
    
    fetch("/api/v1/users" + "?page=" + "&search=" + username.value).then((response) => response.json()).then((responseData) => { 
        let count = responseData["items"];       
        
        if(password.value.length >= 8 && password.value == repassword.value) {
            password.style.border = '1px green solid';
            repassword.style.border = '1px green solid';
            let message = document.getElementById("alert");
            message.style.display = "none";
        } else {
            password.style.border = '1px red solid';
            repassword.style.border = '1px red solid';
            let message = document.getElementById("alert");
                message.style.display = "block";
                message.textContent = "Password should be same";
        }

        if(count.find(items => items.login === username.value)!= undefined || username.value === ""){
            username.style.border = '1px red solid';
            let message = document.getElementById("alert2");
            message.style.display = "block";
            message.textContent = "User with this username is already exist";
            } else {
            username.style.border = '1px green solid';
            let message = document.getElementById("alert2");
            message.style.display = "none";
        }
            
      })
    

}, false);


