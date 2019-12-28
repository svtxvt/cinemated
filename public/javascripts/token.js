let form_ = document.getElementById("form");
form_.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bodyData = new URLSearchParams(formData);
    fetch(form_.action, { method: 'POST', body: bodyData })
        .then(x => x.json())
        .then(authResult => {
            if (authResult.message) {
            let message = document.getElementById("alert");
            message.style.display = "block";
            message.textContent = authResult.message;
            form_.reset();
            }
            else {
            const jwt = authResult.token;
            localStorage.setItem("jwt", jwt);
            window.location.href = "/";
            }
        })
        .catch(console.error);
});

