
//const data= {email:"aniketpoptani100@gmail.com",password:"aniket9644#"};
const myTheme = agGrid.themeQuartz.withParams({
    headerTextColor: "white",
  });
const columnDefination = [{field:"user_name"},
                          {field:"enable",cellRenderer:function(params){
                            var labelElement= document.createElement("label");
                            labelElement.classList.add("switch");
                            var checkbox= document.createElement("input");
                            checkbox.type= "checkbox";
                            checkbox.id= "toggleSwitch"
                            var slider= document.createElement("span");
                            slider.classList.add("slider");
                            labelElement.appendChild(checkbox);
                            labelElement.appendChild(slider);
                            var currentState= params.node.data.allowed;
                            if(currentState == "ENABLED")
                              checkbox.checked= true;
                            else
                              checkbox.checked= false;
                            checkbox.addEventListener("change",()=>{
                              if(checkbox.checked)
                              {
                                currentArray[params.node.data.index]=1;
                                userList[params.node.data.index].allowed= "ENABLED";
                              }
                              else
                              {
                                currentArray[params.node.data.index]=0;
                                userList[params.node.data.index].allowed="DISABLED";
                              }
                            });
                            return labelElement;
                          }}];
var gridHolder = null;
var gridApi = null;
var loginInfo = null;
var permissionArray = Array(0);
var currentArray;
var userList=null;
const showTableData = function (list) {
    if (gridHolder != null && gridApi == null) {
      gridApi = agGrid.createGrid(gridHolder, gridOptions);
      //gridApi.sizeColumnsToFit();
    } else if (gridHolder != null && gridApi != null)
      gridApi.setGridOption("rowData", list);
    else console.error("Grid Reference Error");
  };
function initializePermissionArray(list){
  for(let i=0;i<list.length; i++){
    list[i]['index']=i;
    console.log(list[i]['allowed']);
    if(list[i]['allowed']=="ENABLED")
    permissionArray.push(1);
    else
    permissionArray.push(0);
  }
  console.log(permissionArray);
  userList= list;
  currentArray= Array.from(permissionArray);
}  
function displayTableData(list) {
    gridHolder = document.getElementById("table_view");
    gridHolder.style.display="block";
    gridOptions = {
      theme: myTheme,
      columnDefs: columnDefination,
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true,
        resizable: false,
      },
      
      rowData: list,
      
      autoSizeStrategy: {
        type: "fitGridWidth",
        defaultMinWidth: 100,
        columnLimits: [
          
        ],
      },
    };
    
    gridApi = agGrid.createGrid(gridHolder, gridOptions);
    gridApi.sizeColumnsToFit();
    var adminPanel= document.getElementById("admin-panel");
    adminPanel.style.display="block";
    var loginLoader= document.getElementById("loginLoad");
    loginLoader.style.display= "none";
    var adminHead= document.getElementById("admin_head");
    adminHead.style.display= "block";
    //showTableData(list);
  }
function submitAndGetData(data){
    return getUsers(data);
}
const getUsers = async function (data){
    loginInfo=data;
    return fetch("/getUsers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Network Response is not ok");
    })
    .then((userData) => {
      initializePermissionArray(userData.users);
      displayTableData(userData.users);
    })};
function logoutAdmin(){
    const portal = document.getElementById("table_view");
    portal.style.display = "none";
    const loginHolder = document.getElementById("login_page");
    loginHolder.style.display = "block";
    const adminPanel= document.getElementById("admin-panel");
    adminPanel.style.display= "none";
    var adminHead= document.getElementById("admin_head");
    adminHead.style.display= "none";
    loginInfo=null;
    permissionArray=Array(0);
    gridApi.destroy();
    currentArray=Array(0);
}
function compareArrays(first, second){
  console.log("Permission");
  console.log(first);
  console.log(second);
  for(let index=0; index<first.length; index++){
    if(first[index]!=second[index])
      return true;
  }
  return false;
}
document.addEventListener("DOMContentLoaded",()=>{
    const loginForm = document.getElementById("login_form");
    const loginLoader = document.getElementById("loginLoad");
    const updateBtn = document.getElementById("update_btn");
    const logoutBtn = document.getElementById("logout_btn");
    loginHolder = document.getElementById("login_page");
    loginLoader.style.display = "none"; //enable by block
   logoutBtn.addEventListener("click", function (){
    logoutAdmin();
   }); 
   updateBtn.addEventListener("click", function (){
     if(compareArrays(permissionArray,currentArray))
     {
       var compactUsers=userList.map((user)=>{return {"user_id":user.user_id,"allowed":user.allowed}});
       var packet= {"auth_data":loginInfo, "userPrivelleges":compactUsers};
       fetch("/setPrivellege",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify(packet)
       }).then((response)=>{
          if(response.ok){
            return response.json();
          }
       }).then(result=>{
        //console.log(result);
        if(result.rowsUpdated == permissionArray.length)
          console.log("Updating Success!");
        else
          console.log("Update Failed!")
       });
     }
   }); 
  //Attaching a submit action to the loginHolder form and overriding default submission process
  loginForm.addEventListener("submit", function (event) {
    //Prevent default Form Submission
    event.preventDefault();
    //Get email and password value from input fields of Form...
    var email = loginForm.elements["admin_email"].value;
    var password = loginForm.elements["admin_password"].value;
    var data= {"email":email, "password":password};
    //Display loading ....
    loginLoader.style.display = "block";
    //Hide the form....
    loginHolder.style.display = "none";
    //Submit the form for custom execution....
    submitAndGetData(data);
  });
});      
//Need to decide the view hierarchy and how adminApi.js would perform 