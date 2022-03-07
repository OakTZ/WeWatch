// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.  

var id
var current_tab
var room_id
var latest_msg



//WHEN THE EXTENTION IS BEING INSTALLED
chrome.runtime.onInstalled.addListener(async () => {
    console.log("===========================================")
    //opens welcome page
    let url = chrome.runtime.getURL("htmls/hello.html");
    let tab = await chrome.tabs.create({ url });
    console.log(`Created tab ${tab.id}`);

    //recives id from server
    id=conn_and_recv("get_id")

}
)

//ON ACTIVATED TAB INB CHROME
chrome.tabs.onActivated.addListener( function(activeInfo){

    //checks current tab and update the popup accordingly
    chrome.tabs.get(activeInfo.tabId, function(tab){
        u = tab.url;
        console.log("OnActivated-you are here: "+u);
        if(String(u).includes("https://www.youtube.com/watch")){

            console.log("YOUTUBE")

            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            current_tab=u

            console.log("set current tab to: "+ current_tab)
        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }

        //conn_and_recv("OnActivated: "+u)
    }); 
    


});


//WHEN OPENING A NEW TAB IN CHROME
chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {




    //checks if you changed current tab
    if (tab.active && change.url) {
        console.log("onUpdated-you are here:change "+change.url); 
        console.log("onUpdated-your id is stiil:"+ id); 
        
        if(String(change.url).includes("https://www.youtube.com/watch")){

            console.log("YOUTUBE")

            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
            current_tab=change.url

            console.log("set current tab to: "+ current_tab)
        }

        //conn_and_recv("onUpdated: "+change.url)

    }


});
  

//LISTEN TO MESSAGE OVER CONTENT SCRIPT
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=> {

    
    if (message == 'create new watching room') {

        console.log("create a watching room XDLOLXDLOL")
        sendResponse('got and delivered')

        latest_msg=conn_and_recv("create_room,"+current_tab+","+id)
        console.log(latest_msg)
        
    }
    else if(String(message).includes("enter room,")){
        data=message.split(',');

        console.log("JOINING ROOM,"+data[1]+","+data[2])
        latest_msg=conn_and_recv("join_room,"+data[1]+","+data[2])
        console.log("1"+latest_msg)
        console.log("2"+latest_msg.length)
        console.log("3"+typeof latest_msg)
        console.log("4"+ latest_msg)


        console.log(latest_msg[0])
        sendResponse(latest_msg)
        console.log(latest_msg)
        
    }

    return true
});



//--------------------------DEFS--------------------------------

function conn_and_recv(msg){
    var connection = new WebSocket('ws://localhost:8765'); //let
    var ans ="a"
    connection.onopen = function(e) {
        connection.send(msg)
        console.log("conn_and_recv 4: "+ans)
        console.log("conn_and_recv 5: " + ans[0])
    //console.log("after1:"+ans)
    };
    connection.onmessage=function(event){
        console.log("ttt")
        console.log("onmessage: "+event.data)
        id=event.data //need to wait until gets value
    }
    /*
    connection.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
        ans=event.data
        console.log("conn_and_recv 0: "+ans)
        console.log("conn_and_recv 1: " + ans[0])
        //connection.close()
    });
    */
    //console.log("ans"+ans)
    console.log("conn_and_recv 10: "+ans)
    console.log("conn_and_recv 11: " + ans[0])
    return ans
}


function recv_only(connection, reference ){
//    var connection = new WebSocket('ws://localhost:8765'); //let
//    var ans ="a"
    connection.onmessage=function(event){
        console.log("ttt")
        console.log("onmessage: "+event.data)
        id=event.data
    }
    /*
    connection.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
        ans=event.data
        console.log("conn_and_recv 0: "+ans)
        console.log("conn_and_recv 1: " + ans[0])
        //connection.close()
    });
    */
    //console.log("ans"+ans)
    console.log("conn_and_recv 10: "+ans)
    console.log("conn_and_recv 11: " + ans[0])
    return ans
}
