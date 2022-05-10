
var room_id=""
var room_password=""

//get room details and nofity the bg that the user is in the watching room

chrome.runtime.sendMessage("in watching room", (response) => {
    let data=response.split(',');
    console.log("pre: ",data)
    document.getElementById("room_id").innerHTML=data[0];
    document.getElementById("room_password").innerHTML=data[1];
    
    data.splice(0,2);
    console.log("Data: ",data)
    insert_members(data);
    /*
    for (u_name in data){
        let index=1;

        if(document.getElementById(index.toString())){ // if there is allready a member there -> modifies it

            document.getElementById(index.toString()).innerHTML(u_name);
        }

        else{// else -> creates a new element

            const para = document.createElement("p");
            para.setAttribute("id",index.toString())
            const node = document.createTextNode(u_name);
            para.appendChild(node);
            const element = document.getElementById("members");
            element.appendChild(para);

        }
        index=index+1;
    }
    */

});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    let data=message.split(','); //w.r,new_u,room_id,u1,u2,u3,u4,u5
    data.splice(0,3);
    insert_members(data);
    /*
    for (u_name in data){
        let index=1;

        if(document.getElementById(index.toString())){ // if there is allready a member there -> modifies it

            document.getElementById(index.toString()).innerHTML(u_name);
        }

        else{// else -> creates a new element

            const para = document.createElement("p");
            para.setAttribute("id",index.toString())
            const node = document.createTextNode(u_name);
            para.appendChild(node);
            const element = document.getElementById("members");
            element.appendChild(para);

        }
        index=index+1;
    }
    */

});


function insert_members(data){
    let index=1;
    for (const u_name of data){
        
        console.log(u_name,",",index)
        if(document.getElementById(index.toString())){ // if there is allready a member there -> modifies it

            document.getElementById(index.toString()).innerHTML=u_name;
        }

        else{// else -> creates a new element
            console.log("creating new element "+index.toString())
            var para = document.createElement("p");
            para.setAttribute("id",index.toString())
            var node = document.createTextNode(u_name.toString());
            para.appendChild(node);
            var element = document.getElementById("members");
            element.appendChild(para);

        }
        index=index+1;
    }
}