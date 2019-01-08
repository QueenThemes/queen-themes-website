'use strict';
function mainNavShrink() {
    const header = document.querySelector('.header');
    let scrollYPosition = window.pageYOffset || document.documentElement.scrollTop;
    let trigger = 50;

    if(window.innerWidth > 768) {
        trigger = 60;
    }

    if (scrollYPosition > trigger) {
        header.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
    }
}
document.addEventListener('scroll', function(e){
    mainNavShrink();
});