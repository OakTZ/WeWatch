//content.js

var video
var current_state

var timeline

//when youtube first loading - waits until the video element has loaded
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded when re-entering the page
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){
    video = document.querySelector('video');
    video.pause();
    current_state="paused";

    chrome.runtime.onMessage.addListener(function(request,sender,sendResponce){
        sendResponce("WWWWWWWWWWWWWWWWWW");
    })

    //EVENTS

    video.onplaying=function(){//if user pressed play
        current_state="playing";
        //letting know to server to play everyone in spesific timestamp
        chrome.runtime.sendMessage("watching_room,playing", (response) => {
                
        });
    }
    video.onpause=function(){
        current_state="paused";
        //letting know to server to pause everyone in spesific timestamp
        chrome.runtime.sendMessage("watching_room,paused", (response) => {
                
        });
    }
    video.ontimeupdate=function(){ 

        //if user changed timeline
        if (Math.abs(video.currentTime-timeline)>1){
            //pauseing vid ->letting know to server that time has changed->server plays in sync
            chrome.runtime.sendMessage("watching_room,moved tl", (response) => {
                
            });
        }
        timeline=video.currentTime;

    }

    //setInterval(listen,100)
    setInterval(check_for_ad,2000)
    
    

}
/*
function listen(){

    if(video.paused==false && current_state!="playing"){
        current_state="playing";

    }

    else if (video.paused == true && current_state!="paused"){
        current_state="paused";
        chrome.runtime.sendMessage("PAUSE", (response) => {
                
        });
    }

    
    
}
*/

//AD BLOCKER
function check_for_ad(){

    var skipButton=document.getElementsByClassName("ytp-ad-skip-button");

    //checking if skip button is present
    if(skipButton!=undefined && skipButton.length>0){

        console.log("AD DETECTED");
        skipButton[0].click();
    }
}




// *****HELPING FUNCTIONS*****


//runs the command on spesific UTC time
function run_command(msg){
    data=msg.split(',');
    const cmd=data[0];
    const t_t_r=wait_time(data[1]);
    setTimeout(commands(cmd),t_t_r); ///!!!!!!!!!!!
}


function wait_time(e_time){
    const now=new Date().getTime(); //gets milisecs since Unix Epoch in 1.1.1970 - UTC
    return (parseInt(e_time)-now);
}

function commands(cmd){
    if (cmd=="play"){
        video.play();
    }
    else if (cmd=="pause"){
        video.pause();
    }
    else if (String(cmd).includes("move to time")){
        cmd=cmd.split(":")
        const t=parseInt(cmd[1]);
        video.pause();
        video.currentTime=t;
    }
}