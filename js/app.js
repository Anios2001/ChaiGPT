//Required to include the recorder api in html script tag

var socket_handler= null;
var keyPressed= false;
var isrecording= false;
const columnDefination= [
    {field:"vendor_name"},
    {field:"rate_per_kg"},
    {field:"price"},
    {field:"weight"},
    {field:"discount"},
    {field:"total"}
];

console.log(localStorage.getItem('ft'));
var gridHolder=null;
var loader= null;

const gridOptions= {
    columnDefs: columnDefination,
    defaultColDef:{sortable: true, filter: true, editable:true},
    rowData: [{vendor_name: "Aniket",price:100, rate_per_kg:1.2, weight:124, discount: 100, total:0}]
};
const showTableData = function (data){
    if(gridHolder!= null)
    new agGrid.Grid(gridHolder,gridOptions);
    else 
    console.error('Grid Reference Error');
     
};

//Data Operations start here 
//Update Data Stream Ops 
//Register Interface ..
const register= function (user_data)
{
    console.log(JSON.stringify(user_data));
    return fetch('/register',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_data),
    }).then((response)=>{
    if(response.ok)
        return response.json();
    throw new Error('Network Response is not ok');
    }).then((data)=>{
        if(data && data['msg'])
        console.log(data['msg']);
        else
        console.log(data['auth_id']);
    });
};
//Authentication Interface .....
const authenticate = function (data){
  console.group("Client Auth Interface");
  return fetch("/authenticate", 
    {
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify(data),

    }).then((response)=>{
        if(response.ok)
        return response.json();
        throw new Error('Network Response is not ok');
    }).then((data)=>{
        console.log(data);
        console.groupEnd("Client Auth Interface");
        if(data && data['auth_id']=='')
        return '';
        else
        return data['auth_id'];
    }).catch(e=>{
        localStorage.setItem('error',e);
    });
};
function showListeningDialog(){
    const listningGif= document.getElementById('listening_gif');
    listningGif.style.display= 'flex';
}
function hideListeningDialog(){
    const listningGif= document.getElementById('listening_gif');
    listningGif.style.display= 'none';
}
//Script loader 
function loadScript(url, callback){
    if(url == null || url== undefined){
     console.error('Url is undefined or null');
     return;
    } 
    const script= document.createElement('script');
    script.src= url;
    script.type='text/javascript';
    script.onload= callback;
    document.head.appendChild(script);
}
//Recorder Interface 
function getRecordingAPI(auth_key){
    if(auth_key == null || auth_key == undefined){
        console.error('Real time connection initaited but with null or undefined auth_key'); 
        return;
    } 
    const auth_id= new URLSearchParams(auth_key).toString();
    fetch(`/recorderApi?${auth_id}`,{
        method:'GET',
    }).then(response=>{
        response.blob().then(blob=>{
            const url= window.URL.createObjectURL(blob);
            loadScript(url,()=>{
             console.log('Recorder Initiated!');
            });
        });
    }).catch(e=>{
        console.error(e);
    });
}
//Socket Connection Interface 
function initiateSocketConnection(){
    socket_handler= io();
}
function initiateRealTimeConnection(auth_key){
    if(auth_key == null || auth_key == undefined){
        console.error('Real time connection initaited but with null or undefined auth_key'); 
        return;
    } 
    const auth_id= new URLSearchParams(auth_key).toString();
    fetch(`/socket.io/socket.io.js?${auth_id}`).then((response)=>{
       response.blob().then(blob=>{
        const url= window.URL.createObjectURL(blob);
        loadScript(url, ()=>{
            initiateSocketConnection();
            bindSocket();
        });
       });
    }).catch(e=>{
        console.error('Error while trying to get connection files from server..',e);
    });
}
function bindSocket(){
    if(socket_handler==null){
        console.error('Bind Socket called on null socket handle.');  
        return ;
    } 
    socket_handler.on('s_data',(data)=>{
    console.log(data.constructor.toString());

    } );
    socket_handler.on('dataUpdate',(change)=>{
    if (change.operationType === 'insert') {
            // Handle insert operation
        gridOptions.api.applyTransaction({ add: [change.fullDocument] });
    } else if (change.operationType === 'update') {
            // Handle update operation
        gridOptions.api.applyTransaction({ update: [change.fullDocument] });
    } else if (change.operationType === 'delete') {
            // Handle delete operation
        gridOptions.api.applyTransaction({ remove: [change.documentKey] });
    }
    });
}
function connectToRealTimeData(auth_key){
    //Not Implemented
    console.log("Not Implemented yet");
}
function transferMultiPartData(data){
   var formdata=  new FormData();
   formdata.append('audio',data, 'user_audio.mp3');
   fetch('/processAudioCommand', {
    method: 'POST',
    body: formdata
   }).then(response=>{
         console.log(response);
         console.groupEnd("Audio Transfer Process");
   }).catch(e=>{
         console.error(e);
         console.groupEnd("Audio Transfer Process");
   });
}
//Fetch data Ops
function submitForm(email, pass){
  localStorage.setItem('ft', 'fuvh'); 
  return authenticate({email:email, password:pass});
}
function checkResults(auth_token){

    if(auth_token==undefined || auth_token==null)
      return 102;
    else if (/^\s*$/.test(auth_token))
      return 103;
    else
      return 1;
}
function openPortal(passableData){
    const current = document.getElementById('login_page');
    current.style.display= 'none';
    const portal = document.getElementById('scrollable_view');
    portal.style.display= 'block';
}
function setUpAudioEvents(){
    
    document.addEventListener('keydown', keyDownEvent);
    document.addEventListener('keyup', keyUpEvent);
}
function keyDownEvent(event){
    if((event.key=='Q' || event.key=='q') && !keyPressed && !isrecording)
     {
       keyPressed= true;  
       isrecording= true;
       console.group("RECORDING_API");
       showListeningDialog();
       Recorder.startRecording();  
     }   
}
function keyUpEvent(event){
    if((event.key=='Q' || event.key=='q') && keyPressed && isrecording){
        keyPressed= false;
        Recorder.stopRecording().then((audioBlob)=>{
            
            if(audioBlob == null || audioBlob == undefined){
             console.error('Error while recording the audio...');
             console.groupEnd("RECORDING_API");
            }
            else{
             //Send the blob as a multipart Form Data to the server for processing
             console.groupEnd("RECORDING_API");
             console.group("Audio Transfer Process");
             transferMultiPartData(audioBlob);
            } 
            hideListeningDialog();
        });
        
        isrecording= false;  
    }
}

function showErrorPopup(errorMessage) {
    var errorPopup = document.getElementById('errorPopup');
    const error_holder= document.querySelector('#errorPopup > p');
    error_holder.textContent= errorMessage;
    errorPopup.classList.add('show'); // Add the 'show' class to display the popup
    setTimeout(function() {
      hideErrorPopup(); // Hide the popup after 3 seconds (adjust as needed)
    }, 3000); // 3000 milliseconds = 3 seconds
}
function hidePopup(){
    var popup= document.getElementById('pop-up');
    popup.style.display='none';
}  
function hideErrorPopup() {
    var errorPopup = document.getElementById('errorPopup');
    errorPopup.classList.remove('show'); // Remove the 'show' class to hide the popup
}
function showError(errorString){
    showErrorPopup(errorString);
    console.error(errorString);
}
//Not using now
const startFetchingData= (url)=>fetch('/getData').then((response)=>{
    if(response.ok){
      return response.json();
    }
    else{
      console.log("CLIENT END:: Server Response Error status:", response.status);
      console.log("CLIENT END:: Server Response Error statusText:", response.statusText);  
      throw new Error("Response is not OK!");
    }
}).then((data)=>{
   showTableData(data);

   startStreamingData();
}).catch((error)=>{
    console.error("CLIENT END:: Server Data Fetch failed", error);
}); 
//On document load
document.addEventListener('DOMContentLoaded', ()=>{
    //gridHolder= document.getElementById('scrollable_view');
    //startFetchingData();
    //new agGrid.Grid(gridHolder,gridOptions);
    loader = document.getElementsByClassName('loader').item(0);
    const loginHolder= document.getElementById('login_form');
    loader.style.display= 'none';//enable by block
    loginHolder.addEventListener('submit', function(event){
        event.preventDefault();   
        var email= loginHolder.elements['user_email'].value;
        var password= loginHolder.elements['user_password'].value;
        loader.style.display='block';
        loginHolder.style.display='none'; 
        // authenticate({email:"aniketpoptani100@gmail.com", password:"aniket19292"}).then((auth_id)=>{
        //     console.log(auth_id);
        //     const res_code= checkResults(auth_id);
        //     console.log(res_code);
        //     loader.style.display='none';
        //     loginHolder.style.display='block';
        // });
        submitForm(email,password).then(
            (response)=>{
            
            const res_code= checkResults(response);
            switch(res_code){
                case 1:
                    loader.style.display= 'none';
                    loginHolder.style.display= 'block';
                    openPortal(response);
                    console.group("Recording API Loading Process");
                    getRecordingAPI(response);
                    console.groupEnd("Recording API Loading Process");
                    setUpAudioEvents();
                    console.group("Socket Service Loading Process");
                    connectToRealTimeData(response);
                    console.groupEnd("Socket Service Loading Process");
                    break;
                case 102:
                case 103:
                    loader.style.display='none';
                    showError(response);
                    loginHolder.style.display= 'block';
                    break;
                default:
                    loader.style.display='none';
                    showError('{DEBUG}:Invalid data or null res_code');
                    loginHolder.style.display= 'none';        
            }  
           
        });
        
    });
    
});


