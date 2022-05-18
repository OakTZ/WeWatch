// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.  


/*
var connection

var id
var username // need to add username insert -> do it in the popups

var room=["id","password","url","tabid","ishost"]

var room_members=[] // need to add participants of room

var in_room=false

var room_process=[false,"intervelId"]

var current_tab=["url","id"]
*/

//every time the background.js reloads - gets user's info
/*
chrome.storage.local.get(['userLocal'], async function (result) {
    let userLocal=result.userLocal;
    console.log("userlocal: ",userLocal)
    if (userLocal===undefined){
        const user={
            connection:undefined,
            id:"id",
            username:"username",
            room:["id","password","url","tabid","ishost"],
            room_members:[],
            in_room:false,
            room_process:[false,"intervelId"],
            current_tab:["url","id"]
        }
        console.log("bla",user)
        
        chrome.storage.local.set({userLocal: user}, function () {}); // save it in local.
    }
    
});
*/

var user


//setting up user's info in local storage
chrome.storage.local.get(['userLocal'], async function (result) {
    let ul = result.userLocal;
    if (ul === undefined) {
        console.log("entering user")
        // it means there was nothing before. This way you don't overwrite
        // the user object every time the backgorund.js loads.
        let ul={
            connection:undefined,
            id:"id",
            username:"username",
            room:["id","password","url","tabid","ishost"],
            room_members:[],
            in_room:false,
            room_process:[false,"intervelId"],
            current_tab:["url","id"]
        }
        user=ul;
        await chrome.storage.local.set({userLocal: ul}, function () {}); // save it in local.
        await connect();
    }
    else{
        console.log("rentering user");
        console.log("r_u ",ul);
        user=ul;

        //change popup accordingly
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            let current_tab_id=tabs[0].id;

            chrome.tabs.get(current_tab_id, function(tab){
                var u = tab.url;
        
                user.current_tab[0]=u;
                user.current_tab[1]=tab.id;
        
                if(u==user.room[2] && user.in_room && (user.current_tab[1]==user.room[3] || user.room[3]=="tabid")){
        
                    chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
                    user.room[3]=tab.id;
        
                    run_room_process(false);
                }

                else if(String(u).includes("https://www.youtube.com/watch")){
        
                    chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
                    user.current_tab[0]=u;
                }

                else{
                    chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
                }
        
                update_user(user);
            }); 

        });


        
        //reconfiguring connection with content.js
        if(user.in_room){
            console.log("reconfiguring connection with content.js");

            clearInterval(user.room_process[1]);
            user.room_process[0]=false;

            update_user(user);
            
            run_room_process(true);
        }
    }
});





//WHEN THE EXTENTION IS BEING INSTALLED
chrome.runtime.onInstalled.addListener(async() => { //async
    //opens welcome page
    let url = chrome.runtime.getURL("htmls/hello.html");

    let tab = await chrome.tabs.create({ url });

    
    //await get_user().then(connect());
    //console.log("u: ",u);
    
    //connect to server and recive id 
    //connect();
    
});


//WHEN BACKGROUND.JS IS ABOUT TO GO IDLE
chrome.runtime.onSuspend.addListener(function (){
    update_user(user);//upload user before going idle
});



//WHEN THE ACTIVE TAB CHANGES CHROME
chrome.tabs.onActivated.addListener( function(activeInfo){
    
    
    //checks current tab and update the popup accordingly
    chrome.tabs.get(activeInfo.tabId, function(tab){
        var u = tab.url;
        //console.log("OnActivated-you are here: "+u);

        user.current_tab[0]=u;
        user.current_tab[1]=tab.id;
        

        if(u==user.room[2] && user.in_room && (user.current_tab[1]==user.room[3] || user.room[3]=="tabid")){

            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
            user.room[3]=tab.id;

            

            console.log("onActivated did it")
            run_room_process(false);
        }
        else if(String(u).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            user.current_tab[0]=u;

            

            //console.log("set current tab to: "+ current_tab)
        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }

        update_user(user);
    }); 


   


});


//WHEN THE TAB IS UPDATED -I NEED TO TAKE INTO ACCOUNT IF USER GOES BACKTAB I NEEED TO CHANGE ROOM TO FALSE!
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {


    //console.log("UPDATE")
    //checks if you changed current tab - change is the object of things that have changes and does not have id - id stays the same!!
    //console.log("change.url: "+ change.url)
    if (tab.active && change.url) {
        
        user.current_tab[0]=change.url;
        user.current_tab[1]=tab.id;
        

        if (String(change.url)==user.room[2] && user.in_room && (user.current_tab[1]==user.room[3] || user.room[3]=="tabid")){
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});

            user.room[3]=tab.id;

            

            //console.log("onUpdated did it, room[3]: "+room[3])
            run_room_process(false);
        }
        else if(String(change.url).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});

            user.current_tab[0]=change.url;

            



        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }


        update_user(user);
    }

    
});


/*
//WHEN OPENING A NEW TAB 
chrome.tabs.onCreated.addListener(function(tab){

    current_tab[0]=tab.pendingUrl //becuase the file hasnt fully loaded tab.url=NaN
    current_tab[1]=tab.id
    
    console.log("O.C "+tab.pendingUrl+" and room "+room[2])

    if (String(tab.pendingUrl)==room[2] && in_room){
        chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
        room[3]=tab.id;
        console.log("in on created +room: "+room[3])

        console.log("onCreated did it")
        run_room_process();
    }
    else if(String(tab.url).includes("https://www.youtube.com/watch")){


        chrome.action.setPopup({popup: 'htmls/watching_popup.html'});

        current_tab[0]=tab.url


    }
    else{
        chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
    }
});
*/

//WHEN CLOSING A TAB
chrome.tabs.onRemoved.addListener (function(tabId) {


    //console.log(user.username)


    if (user.in_room){
        //console.log("current tab: "+current_tab[0]+" room tab: "+room[2])
        if (user.current_tab[0]==user.room[2]){

            console.log("OnRemoved - user went out of watching room");
            user.room_process[0]=false;

        
            send_message("exit_room,"+user.room[0]+","+user.id)

            user.in_room=false;
            user.room=["id","password","url","tabid"];
            user.room_members=[];

            update_user(user);
        }
    
    }

});

//WHEN NAVIGATION IS COMMITTED
chrome.webNavigation.onCommitted.addListener(function(details) {



    console.log(user.username)

    
    //if a room tab has been refreshed
    if(["reload", "link", "typed", "generated"].includes(details.transitionType) && details.url==user.room[2] &&details.tabId==user.room[3]){ //NEED TO FIX -> JUST WHEN RELOADING YOU SHOULD REBOT
        //content.js rebot
        console.log("REBOTING");
        clearInterval(user.room_process[1]);
        user.room_process[0]=false;

        update_user(user);
        
        run_room_process(false);
    }
        
    

});

/*
//WHEN A REDIRECT IS ABOUT TO BE EXECUTED
chrome.webRequest.onBeforeRedirect.addListener(function(details){
    console.log("onBeoreRedirect")
    //if user went out of watching room
    if(details.tabId==room[3] && details.documentUrl!=room[2]){

        
        console.log("user redirected out of watching room")
        room_process[0]=false;

        reconnent();
        connection.send("exit_room,"+room[0]+","+id)

        in_room=false
        room=["id","password","url","tabid"]
        

    }
});
*/


//LISTEN TO MESSAGE OVER CONTENT SCRIPT
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){



    //in-room commands (if user is host)
    if (message.split(',')[0]=="watching_room"){ //&& user.in_room &&user.room[4]
        console.log("in here")
        data=message.split(',');

        if(data[1]=="playing"){
            console.log("PLAYING");

            
            send_message("w.r,"+user.room[0]+","+user.id+",play,"+data[2]); //0-w.r,1-room id,2-user id,3-command,4-vid tl
        }

        else if(data[1]=="paused"){
            console.log("PAUSED");

            
            send_message("w.r,"+user.room[0]+","+user.id+",pause,"+data[2]);
        }

        else if (data[1]=="move tl"){
            console.log("MOVED TL");

            
            send_message("w.r,"+user.room[0]+","+user.id+",move tl,"+data[2]);
        }

        else if (data[1]=="exited"){

            console.log("User exited watching room - content script");

            user.room_process[0]=false;
            
            console.log("OnContentScript - user went out of watching room");
            send_message("exit_room,"+user.room[0]+","+user.id);

            user.in_room=false;
            user.room=["id","password","url","tabid"];
            user.room_members=[]

            update_user(user);
            
            
        }
    }

    //k.a bg.js
    else if(message=="k.a"){
        sendResponse("^");
        //chrome.tabs.sendMessage(user.room[3],"k.a",function(response){ 
        //}) 
    }

    //popup messages
    else{
    
        //notify that the user in watching room
        if(message=="in watching room"){
            //give popup room info
            sendResponse(user.room[0]+","+user.room[1]+","+user.room_members.toString());
            

        }

        else if(message=="username"){
            sendResponse(user.username)
        }

        //create new watching room
        else if (message == 'create new watching room') { //need to exit old one when created new one

            
            send_message("create_room,"+user.current_tab[0]+","+user.id);

            user.connection.onmessage=function(event){
                var data=event.data;
                data=data.split(',')
                user.room[0]=data[0];
                user.room[1]=data[1];
                user.room[2]=data[2];
                user.room[3]=user.current_tab[1];
                user.room[4]=true;


                //need to add username list here 
                user.room_members.push(user.username)
                console.log(user.room_members)

                user.in_room=true;

                update_user(user);
                
                chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
                sendResponse("^");

                run_room_process(false);


            }
            
            
        }

        //enters room
        else if(String(message).includes("enter room,")){ //need to exit old one when created new one
            var msg=message.split(',');

            //console.log("JOINING ROOM,"+data[1]+","+data[2])
            send_message("join_room,"+msg[1]+","+msg[2]+","+user.id);

            user.connection.onmessage=function(event){
                let data=event.data.split(',');
                //data=data.split(',');
                if(data[0]=="TRUE"){
            
                    user.room[0]=msg[1];
                    user.room[1]=msg[2];
                    user.room[2]=data[1];
                    user.room[4]=false;
                    user.in_room=true;
                    let temp=data;

                    temp.splice(0,2);
                    user.room_members=temp;

                    update_user(user);
                   
                    //console.log("eve data "+String(event.data))
                    sendResponse(String(event.data));

                    
                }
                else{
                    sendResponse("false id or password");
                }
                
                
            }
    
        }

    }
    return true; //stopping message port closing

});



//--------------------------DEFS--------------------------------


function connect(){

    user.connection = new WebSocket('ws://localhost:8765'); //ws:// 10.30.56.204:8765

    user.connection.onopen = function(e) {
        user.connection.send("get_id");
    };
    user.connection.onmessage=function(event){
        let data=event.data.split(',');
        
        let temp_i=data[0];
        user.id=temp_i;

        let temp_u=data[1];
        user.username=temp_u;
        
        update_user(user);

        console.log("connection: ",user.id,",",user.username);
    };
    //setInterval(keep_alive,10000)
       
}

function send_message(msg){
    check_connection().then((message)=>{
        user.connection.send(msg);
    }).catch((error)=>{
        reconnect();
        user.connection.send(msg);
    }); 
}

function check_connection(){
    return new Promise((resolve,reject)=>{

        if (user.connection==null){
            reject("recconecting")
            
        }
        else if (user.connection.readyState != 1 ){
            reject("recconecting")
        }
        else{
            resolve("connection is still open");
        }
    });
}

function reconnect(){


    user.connection = new WebSocket('ws://localhost:8765 ');

    user.connection.addEventListener("open",h1)
    function h1(){
        user.connection.send("reconnecting,"+user.id+","+user.username);
        user.connection.removeEventListener("open",h1)
    }
    user.connection.addEventListener("message",h2())

    function h2(event){
        console.log("got data ",event.data)
        if (String(event.data).includes("new id,")){
            console.log("getting new id...");

            let temp_i=(event.data.split(','))[1]
            user.id=temp_i;

            update_user(user);
            
            user.connection.removeEventListener("message",h2)
        }
    }

    /*
    user.connection.onopen = function(e) {
        console.log("sending: ",user.id)
        user.connection.send("reconnecting,"+user.id+","+user.username);
    };

    user.connection.onmessage=function(event){

        console.log("got data ",event.data)
        if (String(event.data).includes("new id,")){
            console.log("getting new id...");

            let temp_i=(event.data.split(','))[1]
            user.id=temp_i;

            update_user(user);
            
        }
        else{
            console.log(event.data);
        }

    };
    */
}
/*
async function get_user(){
    console.log("giving user")
    return new Promise(async function(resolve,reject){
        chrome.storage.local.get(['userLocal'], async function (result) {
            var userLocal = result.userLocal;
            resolve(userLocal);
        });
    });
}
*/
function get_user(){
    return new Promise(function (res, rej) {
        chrome.storage.local.get(['userLocal'],function (result) {
          let userLocal = result.userLocal;
          res(userLocal);
        });
    })

}

function update_user(tmp_user){
    console.log("updating user")
    chrome.storage.local.get(['userLocal'], async function (result) {
        var userLocal = tmp_user;
        chrome.storage.local.set({userLocal: userLocal}, function () {}); // save it in local.
        
    });  
}


function run_room_process(is_open){ //here I get content.js messages but  script when background closes the msgs disconnect


    if (user.room_process[0]==false){
        user.room_process[0]=true;

        if(!is_open){
            const tabId=parseInt(user.room[3]);
            chrome.scripting.executeScript(
                {
                target:{tabId: tabId}, 
                files:["content.js"],
                }
                
            );
        }

        //sending content script if user is host or not
        setTimeout(notify_content_info,1000);

        //check room status
        user.room_process[1]=setInterval(check_status,5000);

        update_user(user);
        //server video commands
        user.connection.onmessage=function(event){ //HERE

            var msg=String(event.data);

            console.log("got msg!!!!: ",msg);

            if(msg.includes("w.r,")){

                if (msg.includes("new_u")){
                    console.log("new member has joined")

                    msg=msg.split(','); //w.r,new_u,room_id,u1,u2,u3,u4,u5
                    msg.splice(0,3);
                    user.room_members=msg;
                    console.log("members: ",user.room_members)

                    chrome.tabs.sendMessage(user.room[3],user.room_members,function(response){ //{command:"W?"}
                    
                    }) 
                }
                else if (msg.includes("left_u")){
                    console.log("member has left")

                    msg=msg.split(','); //w.r,left_u,room_id,u1
                    msg.splice(0,3);
                    left_u=msg[0];

                    index=user.room_members.indexOf(left_u);
                    user.room_members.splice(index,1);

                    console.log("left member: ",msg)
                    console.log("members: ",user.room_members)
                    chrome.tabs.sendMessage(user.room[3],user.room_members,function(response){ //{command:"W?"}
                    
                    }) 
                }
                else if(msg.includes("host")){
                    user.room[4]=true;
                    update_user(user);
                    notify_content_info();
                }
                else{
                    console.log("sending content.js"); //0-w.r,1-command,2-vid tl,3-UTC
                    chrome.tabs.sendMessage(user.room[3],msg,function(response){ //{command:"W?"}
                        
                    }) 
                }
            }
            
        }



    }
    else{
        console.log("nope");
        return
    }
    

}

function check_status(){

    //if user exited room
    if (user.room_process[0]==false){

        console.log("exiting msging");
        clearInterval(user.room_process[1]);
    }
    else{
        send_message("k.a"); // keep alive the connection bewtween client and server
        chrome.tabs.sendMessage(user.room[3],"k.a",function(response){ //keep alive the background.js
        }) ;
    }
       
  
}

function notify_content_info(){



    console.log("N I H ",user.room[4])

    chrome.tabs.sendMessage(user.room[3],String(user.room[4]+","+user.room[2]),function(response){ //{command:"W?"}
    }) 
}
