
//content.js
//When a youtube.com/watch... opens

document.addEventListener('yt-navigate-start',process);

//checks if webpgae has been loaded and runs the process
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){
    alert("in content script")
}