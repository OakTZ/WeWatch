//content.js


//boolean to not lets

var video
var vidUrl

var playButton


var ishost=false

var timeline

var server_order=false


//when youtube first loading - waits until the video element has loaded
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded when re-entering the page
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){

    video = document.querySelector('video');


    playButton=document.getElementsByClassName("ytp-play-button ytp-button")[0]
    bar=document.getElementsByClassName("ytp-progress-bar-container")[0]

    video.pause();


    //ON MESSAGE FROM background.js

    chrome.runtime.onMessage.addListener(function(message,sender,sendResponce){

        console.log("msg",message);
        if(message.includes("w.r,")){
            console.log("cmd")
            run_command(message);
        }
        
        else{

            data=message.split(",")

            //ishost
            
            if(data[0]=="true"){
                console.log("t");
                ishost=true;
            }
            else if(data[0]=="false"){
                console.log("f");
                ishost=false;
            }
            
            

            //vidUrl
            vidUrl=data[1]
            console.log(vidUrl)

        }
        


        return true; //stopping message port closing

    });


    
    //disable controls for non-host users
    window.addEventListener('click', event => {
        if (event.target.matches('video')) {
            if(!ishost){
                event.stopPropagation();
            }
        }
    }, true);
    


    //VIDEO EVENTS

    video.onplaying=function(){//if user pressed play
        if (ishost && server_order==false){

            //letting know to server to play everyone in spesific timestamp
            chrome.runtime.sendMessage("watching_room,playing,"+video.currentTime, (response) => {
                    
            });
        }
    }
    video.onpause=function(){
        if (ishost && server_order==false){

            //letting know to server to pause everyone in spesific timestamp
            chrome.runtime.sendMessage("watching_room,paused,"+video.currentTime, (response) => {
                    
            });
        }
    }
    video.ontimeupdate=function(){ 
        if (ishost && server_order==false){
            //if user changed timeline
            if (Math.abs(video.currentTime-timeline)>1){

                //pauseing vid ->letting know to server that time has changed->server plays in sync
                chrome.runtime.sendMessage("watching_room,move tl,"+video.currentTime, (response) => {
                    
                });
            }

            timeline=video.currentTime;
        }
        /*
        else if (!ishost){ // need to figure out problem
            video.currentTime=timeline;
        }
        */

    }


    //WINDOW EVENTS
    /*
    window.onbeforeunload=function(){

        if()
        console.log("exiting content.js")
        chrome.runtime.sendMessage("watching_room,exited", (response) => {
                    
        });
    }
    */
    


    setInterval(check_for_ad,500);

    
    setInterval(disablecontrol,1000);
    

    setInterval(is_open,1000);
     

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


function disablecontrol(){ // can also hide tl bar
    
    if(!ishost && playButton.style.display!="none"){
        console.log("disabling control")
        playButton.style.display="none";
        bar.style.display="none";
    }
    else if(ishost && playButton.style.display!=""){
        console.log("allowing control")
        playButton.style.display="";
        bar.style.display="";
    }

}

function is_open(){

    if (location.href!=vidUrl && vidUrl!=null){
        console.log("exiting content.js from window")
        chrome.runtime.sendMessage("watching_room,exited", (response) => {
                    
        });
        window.close()
    }
}

// *****HELPING FUNCTIONS*****


//runs the command on spesific UTC time
function run_command(msg){ 

    const data=msg.split(','); //0-w.r,1-command,2-vid tl,3-UTC

    const cmd=data[1];
    const t_t_r=wait_time(data[3]);

    video.currentTime=parseInt(data[2]);
    server_order=true;

    if(cmd=="play"){
        console.log("playing at: ",t_t_r)
        setTimeout(function(){
            video.play();
            server_order=false;
        },t_t_r);
    }

    else if(cmd=="pause"){
        console.log("pausing at: ",t_t_r)
        setTimeout(function(){
            video.pause();
            server_order=false;
        },t_t_r);
    }

    else if (cmd=="move tl"){
        console.log("moving tl at: ",t_t_r)
        if(video.paused==false){
            setTimeout(function(){
                video.currentTime=parseInt(data[2]);
                video.play();
                server_order=false;
            },t_t_r);

        }
        else{
            setTimeout(function(){
                video.currentTime=parseInt(data[2]);
                server_order=false;
            },t_t_r);
        }
    }
}


function wait_time(e_time){
    const now=new Date().getTime(); //gets milisecs since Unix Epoch in 1.1.1970 - UTC
    return (parseInt(e_time)-now);
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