//console.log("content@#@$#@%$#@%");



window.onload=function(){

    //CREATE ROOM
    if (document.getElementById("createRoom")){
        document.getElementById("createRoom").addEventListener("click",function(){

            chrome.runtime.sendMessage("create new watching room", (response) => {
                
                window.close()
            });

        });
    } 

    //ENTER ROOM
    if (document.getElementById("enterRoom")){
        document.getElementById("enterRoom").addEventListener("click",function(){

            var room_id=document.getElementById("room_id").value;
            var room_password=document.getElementById("room_password").value;
            
            console.log(room_id)
            console.log(room_password)
            chrome.runtime.sendMessage("enter room,"+room_id+","+room_password, (response) => {
                var data=response
                document.getElementById("didfind").innerHTML=data;
                

            });

        });
    } 

    

}