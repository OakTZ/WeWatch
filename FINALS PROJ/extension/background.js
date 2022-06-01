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
            address:"ws://localhost:8765",
            id:"id",
            username:"username",
            room:["id","password","url","tabid","ishost"],
            room_members:[],
            in_room:false,
            room_process:[false,"intervelId"],
            current_tab:["url","id"],
            buffer: ""
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


    
    }
});


//WHEN THE EXTENTION IS BEING INSTALLED
chrome.runtime.onInstalled.addListener(async() => { //async
    //opens welcome page
    let url = chrome.runtime.getURL("htmls/hello.html");

    let tab = await chrome.tabs.create({ url });
    
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


//WHEN THE TAB IS UPDATED -I NEED TO TAKE INTO ACCOUNT IF USER GOES BACKTAB I NEEED TO CHANGE ROOM TO FALSE!
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {

    if (tab.active && change.url) {
        
        user.current_tab[0]=change.url;
        user.current_tab[1]=tab.id;
        

        if (String(change.url)==user.room[2] && user.in_room && (user.current_tab[1]==user.room[3] || user.room[3]=="tabid")){
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});

            user.room[3]=tab.id;

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


//WHEN CLOSING A TAB
chrome.tabs.onRemoved.addListener (function(tabId) {
 
    if (user.in_room){

        if (user.current_tab[0]==user.room[2]){

            console.log("user went out of watching room");
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


//LISTEN TO MESSAGE OVER CONTENT SCRIPT
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){

    console.log("MSG: "+message)

    //watching room messages
    if (message.split(',')[0]=="watching_room"){ 

        data=message.split(',');
        console.log("TAB INFO: "+sender.id+","+sender.url)

        update_user(user)


        if (data[1]=="joined m"){

            console.log("new member has joined the room")
            data.splice(0,2);
            user.room_members=data;
            update_user(user)
            chrome.tabs.sendMessage(user.room[3],"update_members,",user.room_members,function(response){ //{command:"W?"}
            
            }) 
        }
        else if (data[1]=="left m"){

            let left_u=data[2]
            console.log("left member: ",msg)
            index=user.room_members.indexOf(left_u);
            user.room_members.splice(index,1);

            update_user(user)

            chrome.tabs.sendMessage(user.room[3],"update_members,",user.room_members,function(response){ //{command:"W?"}
            
            }) 
                    
        }
        else if (data[1]=="nowhost"){

            user.room[4]=true;
            update_user(user)
        }
        else if(data[1]=="get info"){

            sendResponse(String("info,"+user.room[4]+","+user.room[0]+","+user.room[2]+","+user.id+","+user.username+","+user.address));
        }
        
        else if (data[1]=="exited"){

            console.log("User exited watching room - content script");
            send_message("exit_room,"+user.room[0]+","+user.id);
            user.room_process[0]=false;
            
            console.log("OnContentScript - user went out of watching room");

            user.in_room=false;
            user.room=["id","password","url","tabid"];
            user.room_members=[]

            update_user(user);
            sendResponse("^")
               
        }
        


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
        else if (message == 'create new watching room') { 

            //update_user(user)
            if (user.in_room){
                sendResponse("you are already in a watching room")
            }
            else{
                let x=send_message("create_room,"+user.current_tab[0]+","+user.id);
                console.log("x: "+x)
                if (x=="X"){
                    console.log("SENDING AGAIN");
                    send_message("create_room,"+user.current_tab[0]+","+user.id);
                }

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
                    //console.log(user.room_members)

                    user.in_room=true;

                    update_user(user);
                    
                    chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
                    sendResponse("^");

                    run_room_process(false);


                }
            }
            

            
            
            
        }

        //enters room
        else if(String(message).includes("enter room,")){ //need to exit old one when created new one
            var msg=message.split(',');

            //console.log("JOINING ROOM,"+data[1]+","+data[2])
        
            if(user.in_room==true){
                sendResponse("you are already in a watching room")
            }
            else{
                let x=send_message("join_room,"+msg[1]+","+msg[2]+","+user.id)
                
                if(x=='X'){
                    console.log("sending again");
                    send_message("join_room,"+msg[1]+","+msg[2]+","+user.id)
                };
                
                user.connection.onmessage=function(event){
                    let data=event.data.split(',');
                    //data=data.split(',');
                    if(data[0]=="TRUE"){ //room:["id","password","url","tabid","ishost"],
                
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

    }
    return true; //stopping message port closing

});



//--------------------------DEFS--------------------------------


function connect(){

    user.connection = new WebSocket(user.address); //ws:// 10.30.56.240:8765 

    
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

    
}

function send_message(msg){

    check_connection().then((message)=>{
        console.log("sending succesfully")
        user.connection.send(msg);

    }).catch((error)=>{
        console.log("reconnecting and then sending")
        reconnect().then(()=>{
            if (!msg.includes("join_room") && !msg.includes("create_room")){
                console.log("sending XD")
                send_message(msg)
            }
            else{
                return("X")
            }
    
        });
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
    
    return new Promise((resolve,reject)=>{
        user.connection = new WebSocket(user.address);

        user.connection.onopen = function(e) {
            console.log("reconnect request")
            user.connection.send("reconnecting,"+user.id+","+user.username);
        };

        user.connection.addEventListener('message',(event)=>{

            console.log("got data ",event.data)
            if (String(event.data).includes("new id,")){
                console.log("got new id by server");

                let temp_i=(event.data.split(','))[1]
                user.id=temp_i;

                update_user(user);
                
            }
            else{
                console.log("recconected succsesfully"+event.data); 
                
            }
            setTimeout(()=>{
                resolve();
            },500); 

        },{once:true});

    });
    
}


function get_user(){
    return new Promise(function (res, rej) {
        chrome.storage.local.get(['userLocal'],function (result) {
          let userLocal = result.userLocal;
          res(userLocal);
        });
    })

}


function update_user(tmp_user){
    //console.log("updating user")
    chrome.storage.local.get(['userLocal'], async function (result) {
        var userLocal = tmp_user;
        chrome.storage.local.set({userLocal: userLocal}, function () {}); // save it in local.
        
    });  
}


function run_room_process(is_open){ 


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
        

        //check room status
        user.room_process[1]=setInterval(check_status,1000);

        update_user(user);
        

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
  
}


