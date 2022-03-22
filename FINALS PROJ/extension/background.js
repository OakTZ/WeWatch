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

var room=["id","password","url"]
var in_room=false

var current_tab




//WHEN THE EXTENTION IS BEING INSTALLED
chrome.runtime.onInstalled.addListener(async () => {
    console.log("===========================================")
    //opens welcome page
    let url = chrome.runtime.getURL("htmls/hello.html");

    let tab = await chrome.tabs.create({ url });
    //console.log(`Created tab ${tab.id}`);

    //connect to server and recive id 
    connect()

}
)

//ON ACTIVATED TAB INB CHROME
chrome.tabs.onActivated.addListener( function(activeInfo){

    //checks current tab and update the popup accordingly
    chrome.tabs.get(activeInfo.tabId, function(tab){
        u = tab.url;
        console.log("OnActivated-you are here: "+u);

        if(u==room[2] && in_room){
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
        }
        else if(String(u).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            current_tab=u

            //console.log("set current tab to: "+ current_tab)
        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }

    }); 


    


});


//WHEN OPENING A NEW TAB IN CHROME
chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {




    //checks if you changed current tab
    if (tab.active && change.url) {
        console.log("onUpdated-you are here:change "+change.url); 
        console.log("onUpdated-your id is stiil:"+ id); 
        

        if (String(change.url)==room[2] && in_room){
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
        }
        else if(String(change.url).includes("https://www.youtube.com/watch")){


            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            current_tab=change.url


        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }



    }


});
  

//LISTEN TO MESSAGE OVER CONTENT SCRIPT
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=> {

    
    if (message == 'create new watching room') {

        connection.send("create_room,"+current_tab+","+id)
        connection.onmessage=function(event){
            var data=event.data;
            data=data.split(',')
            room[0]=data[0]
            room[1]=data[1]
            room[2]=data[2]

            in_room=true
            chrome.action.setPopup({popup: 'htmls/in_room_popup.html'});
            sendResponse("^")

        }
        
        
    }
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
                console.log("eve data "+String(event.data))
                sendResponse(String(event.data))
                

                
            }
            else{
                sendResponse("FALSE INFO")
            }
            
            
        }
   
    }
    else if(message=="give room details"){
        console.log("giving deatils")
        sendResponse(room[0]+","+room[1])

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