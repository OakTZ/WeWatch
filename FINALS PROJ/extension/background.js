// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.  

var connection

var id

var room=["id","password","url","tabid"]
var in_room=false

var room_process=[false,"intervelId"]

var current_tab=["url","id"]




//WHEN THE EXTENTION IS BEING INSTALLED
chrome.runtime.onInstalled.addListener(async () => {
    //opens welcome page
    let url = chrome.runtime.getURL("htmls/hello.html");

    let tab = await chrome.tabs.create({ url });

    //connect to server and recive id 
    connect()

}
)

//WHEN THE ACTIVE TAB CHANGES CHROME
chrome.tabs.onActivated.addListener( function(activeInfo){

    //checks current tab and update the popup accordingly
    chrome.tabs.get(activeInfo.tabId, function(tab){
        var u = tab.url;
        //console.log("OnActivated-you are here: "+u);

        current_tab[0]=u;
        current_tab[1]=tab.id;

        if(u==room[2] && in_room && (current_tab[1]==room[3] || room[3]=="tabid")){

            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
            room[3]=tab.id;

            console.log("onActivated did it")
            run_room_process();
        }
        else if(String(u).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            current_tab[0]=u

            //console.log("set current tab to: "+ current_tab)
        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }


    }); 


    


});


//WHEN THE TAB IS UPDATED -I NEED TO TAKE INTO ACCOUNT IF USER GOES BACKTAB I NEEED TO CHANGE ROOM TO FALSE!
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    //console.log("UPDATE")
    //checks if you changed current tab - change is the object of things that have changes and does not have id - id stays the same!!
    //console.log("change.url: "+ change.url)
    if (tab.active && change.url) {
        current_tab[0]=change.url
        current_tab[1]=tab.id

        if (String(change.url)==room[2] && in_room && (current_tab[1]==room[3] || room[3]=="tabid")){
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
            room[3]=tab.id;

            //console.log("onUpdated did it, room[3]: "+room[3])
            run_room_process();
        }
        else if(String(change.url).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});

            current_tab[0]=change.url



        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }



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

    if (in_room){
        //console.log("current tab: "+current_tab[0]+" room tab: "+room[2])
        if (current_tab[0]==room[2]){
            console.log("user went out of watching room")
            room_process[0]=false;

            connection.send("exit_room,"+room[0]+","+id)

            in_room=false
            room=["id","password","url","tabid"]
        }

        
    }

});

//WHEN NAVIGATION IS COMMITTED
chrome.webNavigation.onCommitted.addListener(function(details) {

    //if a room tab has been refreshed
    if (["reload", "link", "typed", "generated"].includes(details.transitionType) && details.url==room[2] && details.tabId==room[3]){

        //content.js rebot
        clearInterval(room_process[1])
        room_process[0]=false
        run_room_process();
        
    }   
});



//LISTEN TO MESSAGE OVER CONTENT SCRIPT
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){

    //in-room messages
    if (message.split(',')[0]=="watching_room" && in_room){

        data=message.split(',')

        if(data[1]=="playing"){
            console.log("PLAYING")
            connection.send("w.r,"+room[1]+","+id+",play,"+data[2]); //0-w.r,1-room id,2-user id,3-command,4-vid tl
        }

        else if(data[1]=="paused"){
            console.log("PAUSED")
            connection.send("w.r,"+room[1]+",u.id,"+id+",pause,"+data[2]);
        }

        else if (data[1]=="moved tl"){
            console.log("MOVED TL")
            connection.send("w.r,"+room[1]+",u.id,"+id+",move tl,"+data[2]);
        }
    }

    //everything else
    else{
    
        //notify that the user in watching room
        if(message=="in watching room"){
            //give popup room info
            sendResponse(room[0]+","+room[1])
            

        }

        //create new watching room
        else if (message == 'create new watching room') {

            connection.send("create_room,"+current_tab[0]+","+id)
            connection.onmessage=function(event){
                var data=event.data;
                data=data.split(',')
                room[0]=data[0]
                room[1]=data[1]
                room[2]=data[2]
                room[3]=current_tab[1]

                in_room=true
                chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
                sendResponse("^");

                run_room_process();


            }
            
            
        }

        //enters room
        else if(String(message).includes("enter room,")){
            var msg=message.split(',');

            //console.log("JOINING ROOM,"+data[1]+","+data[2])

            connection.send("join_room,"+msg[1]+","+msg[2]+","+id)
            connection.onmessage=function(event){
                var data=event.data
                data=data.split(',')
                if(data[0]=="TRUE"){
            
                    room[0]=msg[1]
                    room[1]=msg[2]
                    room[2]=data[1]

                    in_room=true
                    //console.log("eve data "+String(event.data))
                    sendResponse(String(event.data))
                    
                }
                else{
                    sendResponse("FALSE INFO")
                }
                
                
            }
    
        }

    }
    return true; //stopping message port closing

});



//--------------------------DEFS--------------------------------


function connect(){
    connection = new WebSocket('ws://localhost:8765');
    connection.onopen = function(e) {
        connection.send("get_id");
    };
    connection.onmessage=function(event){
        id=event.data;
    }
    
}

function run_room_process(){
    if (room_process[0]==false){
        room_process[0]=true;
        const tabId=parseInt(room[3]);
        chrome.scripting.executeScript(
            {
            target:{tabId: tabId}, 
            files:["content.js"],
            }
            
        );

        room_process[1]=setInterval(send_contentJs,6000)
    }
    else{
        console.log("nope")
        return
    }
    

}

function send_contentJs(){
    //if user exited room
    if (room_process[0]==false){
        console.log("exiting msging")
        clearInterval(room_process[1])
    }
    else{
        connection.onmessage=function(event){
            const msg=String(event.data);
            if(msg.includes("w.r,")){
                chrome.tabs.sendMessage(room[3],msg,function(response){ //{command:"W?"}
                    console.log(response)
                }) 
            }
            
        }
    
    }     
  
}