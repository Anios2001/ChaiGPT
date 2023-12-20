
//const socket_handler;
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
    gridOptions.api.setRowData(data);   
};

//Data Operations start here 
//Update Data Stream Ops 
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
});};
const authenticate = function (data){
    
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
        if(data && data['auth_id']=='')
        return '';
        else
        return data['auth_id'];
    }).catch(e=>{
        localStorage.setItem('error',e);
    });
};
//socket_handler.on('s_data',(data)=>{
//    console.log(data.constructor.toString());
//
//} );
//socket_handler.on('dataUpdate',(change)=>{
//    if (change.operationType === 'insert') {
        // Handle insert operation
//        gridOptions.api.applyTransaction({ add: [change.fullDocument] });
//    } else if (change.operationType === 'update') {
        // Handle update operation
//        gridOptions.api.applyTransaction({ update: [change.fullDocument] });
//    } else if (change.operationType === 'delete') {
        // Handle delete operation
//        gridOptions.api.applyTransaction({ remove: [change.documentKey] });
//    }
//});
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
function showErrorPopup(errorMessage) {
    var errorPopup = document.getElementById('errorPopup');
    const error_holder= document.querySelector('#errorPopup > p');
    error_holder.textContent= errorMessage;
    errorPopup.classList.add('show'); // Add the 'show' class to display the popup
    setTimeout(function() {
      hideErrorPopup(); // Hide the popup after 3 seconds (adjust as needed)
    }, 3000); // 3000 milliseconds = 3 seconds
}
  
function hideErrorPopup() {
    var errorPopup = document.getElementById('errorPopup');
    errorPopup.classList.remove('show'); // Remove the 'show' class to hide the popup
}
function showError(errorString){
    showErrorPopup(errorString);
    console.error(errorString);
}
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
document.addEventListener('DOMContentLoaded', ()=>{
    // gridHolder= document.getElementById('scrollable_view');
    //startFetchingData();
    loader = document.getElementsByClassName('loader').item(0);
    const loginHolder= document.getElementById('login_form');
    loader.style.display= 'none';//enable by block
    loginHolder.addEventListener('submit', function(event){
        event.preventDefault();   
        var email= loginHolder.elements['user_email'].value;
        var password= loginHolder.elements['user_password'].value;
        loader.style.display='block';
        loginHolder.style.display='none'; 
        authenticate({email:"aniketpoptani100@gmail.com", password:"aniket19292"}).then((auth_id)=>{
            console.log(auth_id);
            const res_code= checkResults(auth_id);
            console.log(res_code);
            loader.style.display='none';
            loginHolder.style.display='block';
        });
        // submitForm(email,password).then(
        //     (response)=>{
            
        //     const res_code= checkResults(response);
        //     switch(res_code){
        //         case 1:
        //             loader.style.display= 'none';
        //             loginHolder.style.display= 'block';
        //             openPortal(response);
        //             break;
        //         case 102:
        //         case 103:
        //             loader.style.display='none';
        //             showError(response);
        //             loginHolder.style.display= 'block';
        //             break;
        //         default:
        //             loader.style.display='none';
        //             showError('{DEBUG}:Invalid data or null res_code');
        //             loginHolder.style.display= 'none';        
        //     }  
           
        // });
        
    });
    
});


