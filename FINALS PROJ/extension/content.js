//content.js

var id
var username
var room_id

var run

var video
var vidUrl

var playButton


var ishost=false

var timeline

var server_order=false

var soc
var soc_active=false
var address

//when youtube first loading - waits until the video element has loaded
document.addEventListener('yt-navigate-finish',process);

//checks if webpgae has been loaded when re-entering the page
if (document.body) process();
else document.addEventListener('DOMContentLoaded',process)




function process(){

    //video elemnet
    video = document.querySelector('video');

    // controls elemnts
    playButton=document.getElementsByClassName("ytp-play-button ytp-button")[0]
    bar=document.getElementsByClassName("ytp-progress-bar-container")[0]

    video.pause();

    //get info from background.js
    chrome.runtime.sendMessage("watching_room,get info", (response) => { //YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
        console.log("GOT INFO",response)

        data=response.split(",")
        console.log(data)

        //ishost
        if(data[1]=="true"){
            console.log("t");
            ishost=true;
        }
        else if(data[1]=="false"){
            console.log("f");
            ishost=false;
            console.log("disabling control")
            playButton.style.display="none";
            bar.style.display="none";
        }
        
        //room id
        room_id=data[2]

        //vidUrl
        vidUrl=data[3]



        //id and username
        id=data[4]
        username=data[5]

        //soc address
        address=data[6]
        
        soc= new WebSocket(address);

        soc.addEventListener("open",h1)
        function h1(){
            console.log("OPENED SOCKET")
            soc.send("reconnecting,"+id+","+username);
            
            coms()
        
            soc.removeEventListener("open",h1)
        }
    });


    //connet to server from content.js

    //ON MESSAGE FROM background.js
    chrome.runtime.onMessage.addListener(function(message,sender,sendResponce){

        console.log("msg",message);
        if(message.includes("w.r,")){
            //console.log("cmd")
            run_command(message);

            return true; //stopping message port closing
        }
        
        else if(message=="close cjs"){
            throw new Error("closing script");
        }
        
        else if(message=="k.a"){
           sendResponce("^");
        }
        /*
        else if(message.includes("info,")){

            console.log("GOT INFO")

            data=message.split(",")
            console.log(data)
            //ishost
            if(data[1]=="true"){
                console.log("t");
                ishost=true;
            }
            else if(data[1]=="false"){
                console.log("f");
                ishost=false;
            }
            
            //room id
            room_id=data[2]

            //vidUrl
            vidUrl=data[3]



            //id and username
            id=data[4]
            username=data[5]

            //soc address
            address=data[6]
            
            soc= new WebSocket(address);

            soc.addEventListener("open",h1)
            function h1(){
                console.log("OPENED SOCKET")
                soc.send("reconnecting,"+id+","+username);
                
                coms()
            
                soc.removeEventListener("open",h1)
            }

            return true; //stopping message port closing

        }
        */
        


        //return true; //stopping message port closing

    });


    
    //Disable controls for non-host users
    window.addEventListener('click', event => {
        if (event.target.matches('video')) {
            if(!ishost){
                event.stopPropagation();
            }
        }
    }, true);
    
    
    

    //VIDEO EVENTS

    //0-w.r,1-room id,2-user id,3-command,4-vid tl
    video.onplaying=function(){//if user pressed play
        //console.log("cs- ",server_order,"&& ih- ",ishost);
        if (ishost && server_order==false){
            console.log("sending onplaying");
            //letting know to server to play everyone in spesific timestamp

            send_message("w.r,"+room_id+","+id+",play,"+video.currentTime);

            /*
            chrome.runtime.sendMessage("watching_room,playing,"+video.currentTime, (response) => {
                    
            });*/
        }
    }
    video.onpause=function(){
        //console.log("cs- ",server_order,"&& ih- ",ishost);
        if (ishost && server_order==false){
            console.log("sending onpause");
            //letting know to server to pause everyone in spesific timestamp
            
            send_message("w.r,"+room_id+","+id+",pause,"+video.currentTime);

            /*
            chrome.runtime.sendMessage("watching_room,paused,"+video.currentTime, (response) => {
                    
            });
            */
        }
    }
    video.ontimeupdate=function(){ 
        //console.log("cs- ",server_order,"&& ih- ",ishost);
        if (ishost && server_order==false){
            //if user changed timeline
            if (Math.abs(video.currentTime-timeline)>1){
                console.log("sending ontimeupdate");
                //pauseing vid ->letting know to server that time has changed->server plays in sync

                send_message("w.r,"+room_id+","+id+",move tl,"+video.currentTime);
                /*
                chrome.runtime.sendMessage("watching_room,move tl,"+video.currentTime, (response) => {
                    
                });
                */
            }

            timeline=video.currentTime;
        }

    }
    



    //AD BLOCKER 
    let observer = new MutationObserver(mutations => { //every time a change is happend in the DOM

        //console.log("OBERVER")

        var skipButton=document.getElementsByClassName("ytp-ad-skip-button");
        var unskipAdd=document.querySelector(".html5-video-player.ad-showing video");

        //checking if skip button is present
        if(skipButton!=undefined && skipButton.length>0){

            //console.log("AD DETECTED - SKIPPABLE");
            skipButton[0].click();
        }
        //if there is unskippable ad
        else if(unskipAdd!=undefined){

            //console.log("AD DETECTED - UNSKIPPABLE");
            unskipAdd.currentTime=10000;
        }
        
    });
    observer.observe(document, { childList: true, subtree: true });


    //USER EXITING THE WATCHING ROOM
    window.onclose(()=>{
        chrome.runtime.sendMessage("watching_room,exited", (response) => {
                    
        });
    });



    //disable/enable control for user
    //setInterval(disablecontrol,1000);
    
    //check if room is still open
    setInterval(is_open,1000);

    //keep connection alive
    setInterval(keep_coms_alive,1000)
    
}




// DISABLE/ENBALE CONTROLS FOR USERS
function disablecontrol(){ 
    
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

//IF URL IS STILL OPEN
function is_open(){

    if (location.href!=vidUrl && vidUrl!=null){
        //console.log("exiting content.js from window")
        send_message("exit_room,"+room_id+","+user.id);
        
        chrome.runtime.sendMessage("watching_room,exited", (response) => {
                    
        });
        window.close()
    }
}


//KEEP BG ALIVE WHILE IN ROOM
function keep_coms_alive(){
    soc.sendMessage("k.a")
}

function coms(){
    soc.onmessage=function(event){ //HERE

        var msg=String(event.data);

        console.log("got msg!!!!: ",msg);

        if(msg.includes("w.r,")){

            if (msg.includes("new_u")){
                console.log("NEW MEMBER HAS JOINED")

                msg=msg.split(','); //w.r,new_u,room_id,u1,u2,u3,u4,u5
                msg.splice(0,3);
                let room_members=msg;
                //console.log("members: ",user.room_members)//u1,u2,u3,u4,u5

                //notify bg
                chrome.runtime.sendMessage("watching_room,joined m,"+room_members, (response) => {
                    
                });

            }
            else if (msg.includes("left_u")){
                //console.log("member has left")

                msg=msg.split(','); //w.r,left_u,room_id,u1
                msg.splice(0,3);
                let left_u=msg[0];

                //notify bg
                chrome.runtime.sendMessage("watching_room,left m,"+left_u, (response) => {
                    
                });

                /*
                index=user.room_members.indexOf(left_u);
                user.room_members.splice(index,1);
                */

                /*
                console.log("left member: ",msg)
                console.log("members: ",user.room_members)
                chrome.tabs.sendMessage(user.room[3],"update_members,",user.room_members,function(response){ //{command:"W?"}
                
                }) 
                */
            }
            else if(msg.includes("host")){
                ishost=true;

                console.log("allowing control")
                playButton.style.display="";
                bar.style.display="";

                //notify bg
                chrome.runtime.sendMessage("watching_room,nowhost,", (response) => {
                    
                });
            }
            else{
                run_command(msg)
            }
        }
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



function send_message(msg){
    check_connection().then((message)=>{
        soc.send(msg);
    }).catch((error)=>{
        reconnect().then(soc.send(msg));
    }); 
}

function check_connection(){
    return new Promise((resolve,reject)=>{

        if (soc==null){
            reject("recconecting")
            
        }
        else if (soc.readyState != 1 ){
            reject("recconecting")
        }
        else{
            resolve("connection is still open");
        }
    });
}

function reconnect(){

    return new Promise((resolve,reject)=>{
        soc = new WebSocket(address);

        soc.onopen = function(e) {
            //console.log("sending: ",user.id)
            soc.send("reconnecting,"+user.id+","+user.username);
        };

        soc.onmessage=function(event){
            resolve();
        };

    });
    
}
