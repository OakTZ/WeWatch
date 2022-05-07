var username

window.onload=function(){

    chrome.runtime.sendMessage("username", (response) => {

        let temp=response;  
        username=temp;
        console.log("popups got username: ",username);
        
        document.getElementById("username").innerHTML=username;

        
    });

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
            

            chrome.runtime.sendMessage("enter room,"+room_id+","+room_password, (response) => {

                var data=response
                data=data.split(',')

                document.getElementById("didfind").innerHTML=data[0];

                if(data[0]=="TRUE"){
                    console.log("d1 "+data[1])
                    window.open(data[1])
                }
                
            });
        });
    } 
    /*
    //IF IN WATCHING ROOM 
    if (document.getElementById("inWatchingRoom")){
        //GIVE ROOM DETAILS
        chrome.runtime.sendMessage("in watching room", (response) => {
            data=response.split(',');
            document.getElementById("room_id").innerHTML=data[0]
            document.getElementById("room_password").innerHTML=data[1]

        });
    

    }
    */

}
