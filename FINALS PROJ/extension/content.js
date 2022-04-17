var video
//var commands={'play':video.play(),'pause':video.pause()} //could be function(){video.pause()}

//when youtube first loading - waits until the video element has loaded
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded when re-entering the page
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){
    video = document.querySelector('video');
    video.pause();
    //need to implement some sort of being ready...
    while (true){
        //listen on port...
        //run commands
        //send current time
    }

    
}

//runs the command on spesific UTC time
function run_command(msg){
    data=msg.split(',')
    const cmd=data[0]
    const t_t_r=wait_time(data[1])
    setTimeout(commands(cmd),t_t_r)
}


function wait_time(e_time){
    const now=new Date().getTime(); //gets milisecs since Unix Epoch in 1.1.1970 - UTC
    return (parseInt(e_time)-now)
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
        const t=parseInt(cmd[1])
        video.pause();
        video.currentTime=t;
    }
}

