
//const socket_handler;
const columnDefination= [
    {field:"vendor_name"},
    {field:"rate_per_kg"},
    {field:"price"},
    {field:"weight"},
    {field:"discount"},
    {field:"total"}
];
var gridHolder=null;
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
return fetch('/authenticate', 
{
 method:'POST',
 headers:{
    'Content-Type':'application/json'
 },
 body:JSON.stringify(data),

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
    gridHolder= document.getElementById('scrollable_view');
    //startFetchingData();
    console.log("Loaded");
    authenticate().catch(e=>console.error(e));
    
});


