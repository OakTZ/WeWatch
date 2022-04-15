
var room_id=""
var room_password=""

//get room details and nofity the bg that the user is in the watching room

chrome.runtime.sendMessage("in watching room", (response) => {
    data=response.split(',');
    document.getElementById("room_id").innerHTML=data[0]
    document.getElementById("room_password").innerHTML=data[1]

});


