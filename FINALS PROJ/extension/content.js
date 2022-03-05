//console.log("content@#@$#@%$#@%");



window.onload=function(){
    try{
        document.getElementById("createRoom").addEventListener("click",function(){

            chrome.runtime.sendMessage("create new watching room", (response) => {
                
                //console.log('received user data', response);

            });

        });
    } catch(error){
        console.log("CATUGHT: "+error)
    }

    try{
        document.getElementById("enterRoom").addEventListener("click",function(){

            var room_id=document.getElementById("room_id").value;
            var room_password=document.getElementById("room_password").value;
            
            console.log(room_id)
            console.log(room_password)
            chrome.runtime.sendMessage("enter room,"+room_id+","+room_password, (response) => {
                
                document.getElementById("didfind").innerHTML=response;

            });

        });
    } catch(error){
        console.log("CATUGHT: "+error)
    }

}