
//content.js
//When a youtube.com/watch... opens

//when youtube first loading - waits until the video element has loaded
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded when re-entering the page
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){
    video = document.querySelector('video');
    video.pause();
    alert("yt-navigate-finish")
}

