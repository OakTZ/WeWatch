//content.js


//boolean to not lets

var video
var current_state

var ishost

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


    //ON MESSAGE FROM background.js

    chrome.runtime.onMessage.addListener(function(message,sender,sendResponce){
        console.log("msg",message);
        if(message.includes("w.r,") && ishost==false){
            console.log("WHAT>@")
        }
        else{
            if(message=="true"){
                console.log("t")
                ishost=true
            }
            else if(message=="false"){
                ishost=false
            }
        }


        return true; //stopping message port closing

    });



    //disable controls for non-host users
    video.addEventListener('click',function(){
        console.log("IN CLICK")
        console.log(ishost)
        if(!ishost){
            if (video.paused){
                video.play();
            }
            else{
                video.pause();
            }
        }
    });


    //EVENTS

    video.onplaying=function(){//if user pressed play
        if (ishost){
            current_state="playing";
            //letting know to server to play everyone in spesific timestamp
            chrome.runtime.sendMessage("watching_room,playing,"+video.currentTime, (response) => {
                    
            });
        }
    }
    video.onpause=function(){
        if (ishost){
            current_state="paused";
            //letting know to server to pause everyone in spesific timestamp
            chrome.runtime.sendMessage("watching_room,paused,"+video.currentTime, (response) => {
                    
            });
        }
    }
    video.ontimeupdate=function(){ 
        if (ishost){
            //if user changed timeline
            if (Math.abs(video.currentTime-timeline)>1){
                //pauseing vid ->letting know to server that time has changed->server plays in sync
                chrome.runtime.sendMessage("watching_room,moved tl,"+video.currentTime, (response) => {
                    
                });
            }
            timeline=video.currentTime;
        }

    }


    //setInterval(listen,100)
    setInterval(check_for_ad,500)

    if(ishost==false){
        setInterval(disablecontrol,5000);
    }
     

}



//AD BLOCKER
function check_for_ad(){

    var skipButton=document.getElementsByClassName("ytp-ad-skip-button");

    //checking if skip button is present
    if(skipButton!=undefined && skipButton.length>0){

        console.log("AD DETECTED");
        skipButton[0].click();
    }
}


function disablecontrol(){
    
    var playButton=document.getElementsByClassName("ytp-play-button ytp-button")[0]

    if(playButton!=undefined &&playButton.length>0){
        playButton.remove();
    }

}

// *****HELPING FUNCTIONS*****


//runs the command on spesific UTC time
function run_command(msg){ 

    const data=msg.split(','); //0-w.r,1-command,2-vid tl,3-UTC

    const cmd=data[1];
    const t_t_r=wait_time(data[3]);

    video.currentTime=parseInt(data[2]);

    if(cmd=="play"){
        setTimeout(video.play(),t_t_r);
    }

    else if(cmd=="pause"){
        setTimeout(video.pause(),t_t_r);
    }

    else if (cmd=="move tl"){
        setTimeout(video.play(),t_t_r);
    }
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