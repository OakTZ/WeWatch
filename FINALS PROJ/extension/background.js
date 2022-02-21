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

chrome.runtime.onInstalled.addListener(async () => {
    let url = chrome.runtime.getURL("htmls/hello.html");
    let tab = await chrome.tabs.create({ url });
    console.log(`Created tab ${tab.id}`);

   id=conn_and_recv("get_id")

}
)


chrome.tabs.onActivated.addListener( function(activeInfo){

    
    chrome.tabs.get(activeInfo.tabId, function(tab){
        u = tab.url;
        console.log("OnActivated-you are here: "+u);
        if(String(u).includes("https://www.youtube.com/watch")){
            
            console.log("YOUTUBE")

            chrome.action.setPopup({popup: 'htmls/watching_popup.html'});
        }
        else{
            chrome.action.setPopup({popup: 'htmls/dif_popup.html'});
        }

        conn_and_recv("OnActivated: "+u)
    }); 
    
    /*
    chrome.tabs.get(activeInfo.tabId, function(tab){
        u = tab.url;
        console.log("OnActivated-you are here:"+u);
        connection.send(u)
    });
    */
});


chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {


    /*

    var connection = await new WebSocket('ws://localhost:8765'); //let
    console.log("connection established")
    connection.onopen = function(e) {
    
        //alert("[open] Connection established");
        //alert("Sending to server");
        //var url=chrome.runtime.getURL();//"html/popup.html

        //checks if you changed current tab
        if (tab.active && change.url) {
            console.log("onUpdated-you are here:change "+change.url); 
            console.log("onUpdated-your id is stiil:"+ id); 
            connection.send(change.url)

        }
        
        
    };
    */

    //checks if you changed current tab
    if (tab.active && change.url) {
        console.log("onUpdated-you are here:change "+change.url); 
        console.log("onUpdated-your id is stiil:"+ id); 

        conn_and_recv("onUpdated: "+change.url)

    }


});
  



function conn_and_recv(msg){
    var connection = new WebSocket('ws://localhost:8765'); //let
    let ans = []
    connection.onopen = function(e) {
        connection.send(msg)
        connection.addEventListener('message', function (event) {
            console.log('Message from server ', event.data);
            ans[0] = event.data
            //console.log("ansbefore"+ ans)
        });
        //console.log("after1:"+ans)
    };
    //console.log("ans"+ans)
    return ans
}