const SERVER_ADDRESS= "localhost";
const SERVER_PORT= 8001;
const server_socket= ```wss://${SERVER_ADDRESS}:${SERVER_PORT}```;
const webSocket= new WebSocket(server_socket);
webSocket.onopen= function (event){
   console.log('Connected to audio server')
};
webSocket.onmessage= function (event){
    const recievedData= event.data;
    console.log('Recieved Data', recievedData);
};
webSocket.onerror= function (error){
    console.log(```Error occured:: ${error}```);
};
webSocket.onclose= function (event){
    if(event.wasClean){
        console.log('Connection closed cleanly');
    }
    else{
        console.log('Connection abrubptly closed');
        console.log('Code:', event.code,'Reason:', event.reason);
    }
};
function sendAudioBlob(audioStreamData){
    if(webSocket.readyState == WebSocket.OPEN)
     webSocket.send(audioStreamData);
    else
     console.log("Socket is not open for data... Check connection"); 
}