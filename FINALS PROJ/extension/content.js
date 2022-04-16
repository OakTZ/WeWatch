
//content.js
//When a youtube.com/watch... opens

//
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded and runs the process
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process_one(){
    video = document.querySelector('video');
    video.pause();
    alert("yt-navigate-finish")

}

function process_two(){
    video = document.querySelector('video');
    video.pause();
    alert("document.body")

}

function process_three(){
    video = document.querySelector('video');
    video.pause();
    alert("document.body")

}