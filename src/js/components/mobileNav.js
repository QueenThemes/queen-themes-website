'use strict';
const navButton = document.querySelector('.nav-button');
function mobileNav() {
    const header = document.querySelector('.header');
    header.classList.toggle('nav-active');
    document.body.classList.toggle('locked');
}
if(navButton){
    navButton.addEventListener('click', function(e) {
        mobileNav();
    });
}