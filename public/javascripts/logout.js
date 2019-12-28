let logout = document.getElementById("logout");
if (logout) {
    logout.addEventListener('click', () => {
        localStorage.removeItem('jwt');
    });
};