//console.log("content@#@$#@%$#@%");



window.onload=function(){

    document.getElementById("createRoom").addEventListener("click",function(){

        console.log("PRESSED");
        chrome.runtime.sendMessage('create new watching room', (response) => {
            
            console.log('received user data', response);

        });

    });

}