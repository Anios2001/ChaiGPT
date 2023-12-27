//SINGLE PAGE APPLICATION
//Client Socket Connection Handler
var socket_handler= null;
//Initialization of key process tracking variables 
var keyPressed= false;
var isrecording= false;
var loader= null;
//Defining the main table column structure....
const columnDefination= [
    {field:"vendor_name"},
    {field:"rate_per_kg"},
    {field:"price"},
    {field:"weight"},
    {field:"discount"},
    {field:"total"}
];
//Holder variable for grid 
var gridHolder=null;
//Holder for saving the attributes of the table
const gridOptions= {
    columnDefs: columnDefination,
    defaultColDef:{sortable: true, filter: true, editable:true},
    rowData: [{vendor_name: "Aniket",price:100, rate_per_kg:1.2, weight:124, discount: 100, total:0}]
};
//function that displays passed data in grid 
const showTableData = function (data){
    if(gridHolder!= null)
    new agGrid.Grid(gridHolder,gridOptions);
    else 
    console.error('Grid Reference Error');
     
};


//View management Operations-------------------------------------------------------
//Display Result Process .....
function displayProcessedAnswer(SALE_DATA){
   const displayPopup= document.getElementById('pop-up');
    
   let base_html= `
   <section class="pop-up-footer">
     Want to add the this data into the table ? Or Discard it ?
   </section>
   <button class="btn_class white_btn_class_unselected">
     Add to the list
   </button>
   <button class="btn_class white_btn_class_selected">Abort</button>
     `;
    let htmlCode=``; 
    for (let [key,value] of Object.entries(SALE_DATA)){
      htmlCode += `<article class="field">
                    <b class="title">${key}:</b>
                    <b class="value">${value}</b>
                   </article>`
    }
    htmlCode+= base_html;
    hideWaitingForServerDialog();
    displayPopup.insertAdjacentHTML('beforeend',htmlCode);
}
//Show listening dialog
function showListeningDialog(){
    const popup_view= document.getElementById('pop-up');
    popup_view.style.display= 'flex';
    const listningGif= document.getElementById('listening_gif');
    listningGif.style.display= 'flex';
}
//Hide listening dialog
function hideListeningDialog(){
    const listningGif= document.getElementById('listening_gif');
    listningGif.style.display= 'none';
}
//Show waiting dialog
function showWaitingForServerDialog(){
    const server_wait= document.getElementById('waiting_gif');
    server_wait.style.display= 'flex';
}
//Hide waiting dialog
function hideWaitingForServerDialog(){
    const server_wait= document.getElementById('waiting_gif');
    server_wait.style.display='none';
}
//Open Portal
function openPortal(passableData){
    const current = document.getElementById('login_page');
    current.style.display= 'none';
    const portal = document.getElementById('scrollable_view');
    portal.style.display= 'block';
}
//Show Error Popup
function showErrorPopup(errorMessage) {
    var errorPopup = document.getElementById('errorPopup');
    const error_holder= document.querySelector('#errorPopup > p');
    error_holder.textContent= errorMessage;
    errorPopup.classList.add('show'); // Add the 'show' class to display the popup
    setTimeout(function() {
      hideErrorPopup(); // Hide the popup after 3 seconds (adjust as needed)
    }, 3000); // 3000 milliseconds = 3 seconds
}
//Hide Popup like listening and answer view...
function hidePopup(){
    var popup= document.getElementById('pop-up');
    popup.style.display='none';
}  
// Hide Error Popup
function hideErrorPopup() {
    var errorPopup = document.getElementById('errorPopup');
    errorPopup.classList.remove('show'); // Remove the 'show' class to hide the popup
}
//--------------------------------------END OF VIEW MANIPULATION CODE --------------------------------------
//--------------------------------------Data Layer Code--------------------------------------------------
//Script loader 
//Client Business Logic Code starts below............................................ 
//Register Process ..
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
//Authentication Process .....
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
//Load Script for Recorder API and Socket API
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
//Recording API loader using auth_key
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
//Socket Connection intiation
function initiateSocketConnection(){
    socket_handler= io();
}
//Socket Files loader using the auth_key
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
//Multi Part HTTP data transfer process postingd data as FormData through Promise Chaining
function transferMultiPartData(data){
   var formdata=  new FormData();
   hideListeningDialog();
   showWaitingForServerDialog();
   formdata.append('audio',data, 'user_audio.mp3');
   fetch('/processAudioCommand', {
    method: 'POST',
    body: formdata
   }).then(response=>{
         if(!response.ok){
            throw new Error('Response is not ok');
         }
         else{
            return response.json()
        } 
   }).then((data)=>{
        const len= Object.keys(data).length;
        console.log(data);
        console.log(len);
        if(len && len > 0){  
          displayProcessedAnswer(data);
        }
        else{
          console.log('result from server not properly formatted'); 
        }
        console.groupEnd("Audio Transfer Process");
   })
   .catch(e=>{
         console.error(e);
         console.groupEnd("Audio Transfer Process");
   });
}
//Submit the email and password for authentication
function submitForm(email, pass){
  //localStorage.setItem('ft', 'fuvh'); 
  return authenticate({email:email, password:pass});
}
//Check the vailidity of auth Token recived or used from the cached storage
function checkResults(auth_token){

    if(auth_token==undefined || auth_token==null)
      return 102;
    else if (/^\s*$/.test(auth_token))
      return 103;
    else
      return 1;
}
//Attach the keyEvents to listeners
function setUpAudioEvents(){
    
    document.addEventListener('keydown', keyDownEvent);
    document.addEventListener('keyup', keyUpEvent);
}
//Key Down Event to prevent continous function execution on key hold
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
//Key Up Event designed to prevent continous function execution on key hold
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
            
        });
        
        isrecording= false;  
    }
}
//Utility function display red bar error at client side takes error string
function showError(errorString){
    showErrorPopup(errorString);
    console.error(errorString);
}
//Not using now
//Set up the functionality of sockets.....
//Not implemented right now
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
//Not implemented yet
function connectToRealTimeData(auth_key){
    //Not Implemented
    console.log("Not Implemented yet");
}
//Need to decide to use or not 
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
//Client Side Application Entry Point..........................................................
document.addEventListener('DOMContentLoaded', ()=>{
    //gridHolder= document.getElementById('scrollable_view');
    //startFetchingData();
    //new agGrid.Grid(gridHolder,gridOptions);
    //Instantiate the loading views...
    loader = document.getElementsByClassName('loader').item(0);
    //Instantiate the login handler...
    const loginHolder= document.getElementById('login_form');
    //Intiate them with expected behaviour loader=none login-->displayed
    loader.style.display= 'none';//enable by block
    //Attaching a submit action to the loginHolder form and overriding default submission process
    loginHolder.addEventListener('submit', function(event){
        //Prevent default Form Submission 
        event.preventDefault();   
        //Get email and password value from input fields of Form...
        var email= loginHolder.elements['user_email'].value;
        var password= loginHolder.elements['user_password'].value;
        //Display loading ....
        loader.style.display='block';
        //Hide the form....
        loginHolder.style.display='none'; 
        //Submit the form for custom execution....
        submitForm(email,password).then(
            (response)=>{
            //Check response validity....
            const res_code= checkResults(response);
            switch(res_code){
                case 1:
                    //Authentication success.....
                    //Revert the views
                    loader.style.display= 'none';
                    loginHolder.style.display= 'block';
                    //Open Portal with the auth id 
                    openPortal(response);
                    //Get Recording API using auth_id
                    console.group("Recording API Loading Process");
                    getRecordingAPI(response);
                    console.groupEnd("Recording API Loading Process");
                    //Attach redorder api to events
                    setUpAudioEvents();
                    //Get and attach real time data service...
                    //Not Implemented...
                    console.group("Socket Service Loading Process");
                    // connectToRealTimeData(response);
                    console.groupEnd("Socket Service Loading Process");
                    break;
                case 102:
                case 103:
                    //Remove loading from view
                    loader.style.display='none';
                    //Show error 
                    showError(response);
                    //Revert the login screen display
                    loginHolder.style.display= 'block';
                    break;
                default:
                    //Remove loading on network errors
                    loader.style.display='none';
                    //Show Error
                    showError('{DEBUG}:Invalid data or null res_code');
                    //Revet the login screen 
                    loginHolder.style.display= 'block';        
            }  
           
        });
        
    });
    
});


