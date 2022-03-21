window.onload=function(){

    chrome.runtime.sendMessage("give room details", (response) => {
        data=response.split(',');
        document.getElementById("room_id").innerHTML=data[0]
        document.getElementById("room_password").innerHTML=data[1]
    });
}
