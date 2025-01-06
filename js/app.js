//SINGLE PAGE APPLICATION
//Client Socket Connection Handler
var socket_handler = null;
//Initialization of key process tracking variables
var keyPressed = false;
var isrecording = false;
//Ag-grid api theme
var aboutBtn = null;
var registerBtn = null;
var loginBtn = null;
var registerHolder = null;
var loginHolder = null;
var auth_id = null;
var logoutBtn = null;
//import "alpinejs";
var totalRevenueTxt;
var totalTodaysRevenueTxt;
var avgDiscountTxt;
const myTheme = agGrid.themeQuartz.withParams({
  headerTextColor: "white",
});
//Defining the main table column structure....
const columnDefination = [
  {
    field: "timestamp",
    cellStyle: { fontSize: "20px", fontWeight: "600" },
    type: "date",
    filter: true,
    resizable: false,
    valueFormatter: (params) => {
      return new Date(params.value).toLocaleString();
    },
  },
  {
    field: "vendor_name",
    cellStyle: { fontSize: "20px", fontWeight: "700" },
  },
  {
    field: "rate_per_kg",
    cellStyle: { fontSize: "20px", fontWeight: "600" },
  },
  {
    field: "price",
    cellStyle: { fontSize: "20px", fontWeight: "700" },
  },
  {
    field: "weight",
    cellStyle: { fontSize: "20px", fontWeight: "700" },
  },
  {
    field: "discount",
    cellStyle: { fontSize: "20px", fontWeight: "600" },
  },
  {
    field: "net",
    cellStyle: { fontSize: "20px", fontWeight: "800" },
  },
  {
    field: "delete",
    cellRenderer: function (params) {
      // Create a delete button for each row

      var deleteBtn = document.createElement("button");

      deleteBtn.classList.add("deleteBtn");
      deleteBtn.innerHTML = "Delete";
      deleteBtn.addEventListener("click", function () {
        var selectedRow = params.node;
        var selectedData = selectedRow.data;
        var gridApi = params.api;
        socket_handler.on("deletionComplete", (deletedData) => {
          // Remove the selected row from the grid's data
          gridApi.applyTransaction({ remove: [selectedData] });
        });
        socket_handler.on("deletionFailed", (data) => {
          showErrorPopup("Deleting Record Failed, Check Network");
        });
        socket_handler.emit("deleteSaleRecord", {
          sale_id: selectedData.sale_id,
          user_id: selectedData.user_id,
        });
        //console.log(`Deleting Sale Record ${selectedData.sale_id}`);
      });

      return deleteBtn;
    },
  },
];
//Holder variable for grid
var gridHolder = null;
var gridApi = null;
//Holder for saving the attributes of the table

//function that displays passed data in grid
const showTableData = function (list) {
  if (gridHolder != null && gridApi == null) {
    gridApi = agGrid.createGrid(gridHolder, gridOptions);
    //gridApi.sizeColumnsToFit();
  } else if (gridHolder != null && gridApi != null)
    gridApi.setGridOption("rowData", list);
  else console.error("Grid Reference Error");
};
//showTableData("");

//View management Operations-------------------------------------------------------
//Display Result Process .....
function displayProcessedAnswer(auth_id, SALE_DATA) {
  const displayPopup = document.getElementById("pop-up");

  let base_html = `
   <section class="pop-up-footer">
     Want to add the this data into the table ? Or Discard it ?
   </section>
   <button id="approveNewRecord" class="btn_class white_btn_class_unselected">
     Add to the list
   </button>
   <button id="abortNewRecord" class="btn_class white_btn_class_selected">Abort</button>
     `;
  let htmlCode = ``;
  for (let [key, value] of Object.entries(SALE_DATA)) {
    htmlCode += `<article class="field">
                    <b class="title">${key}:</b>
                    <b class="value">${value}</b>
                   </article>`;
  }
  htmlCode += base_html;
  hideWaitingForServerDialog();
  displayPopup.insertAdjacentHTML("beforeend", htmlCode);
  setUpApproveAndCancelListeners(displayPopup, auth_id, SALE_DATA);
}
//Set up approve and cancel Listeners
function setUpApproveAndCancelListeners(displayContext, auth_id, data) {
  const approveBtn = document.getElementById("approveNewRecord");
  const abortBtn = document.getElementById("abortNewRecord");
  // console.log("Control Reaches Here");
  approveBtn.addEventListener("click", (event) => {
    fetch("/addSalesRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_id: auth_id, record: data }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network Response is not Ok");
        }
        return response.json();
      })
      .then((data) => {
        //console.log(data);
        displayContext.innerHTML = `<span class="close-btn" onclick="hidePopup()">&times;</span>
            <article id="listening_gif" class="listening_part">
              <img
                src="./images/gifs/listening.gif"
                height="100px"
                width="100px"
              />
              <div class="title">Listening, start speaking....</div>
            </article>
            <article id="waiting_gif" class="listening_part">
              <img
                src="./images/gifs/waiting.gif"
                height="100px"
                width="150px"
              />
              <div class="title">Processing the statement...</div>
            </article>`;
        hidePopup();
        if (data["code"] == 1)
          showSuccessPopup(`Record Added Successfully`, 500);
        else showErrorPopup(`Record Addition Failed`);
      })
      .catch((e) => {
        localStorage.setItem("error", e);
      });
  });
  abortBtn.addEventListener("click", (event) => {
    displayContext.innerHTML = `<span class="close-btn" onclick="hidePopup()">&times;</span>
            <article id="listening_gif" class="listening_part">
              <img
                src="./images/gifs/listening.gif"
                height="100px"
                width="100px"
              />
              <div class="title">Listening, start speaking....</div>
            </article>
            <article id="waiting_gif" class="listening_part">
              <img
                src="./images/gifs/waiting.gif"
                height="100px"
                width="150px"
              />
              <div class="title">Processing the statement...</div>
            </article>`;
    hidePopup();
  });
}
//Show listening dialog
function showListeningDialog() {
  const popup_view = document.getElementById("pop-up");
  popup_view.style.display = "flex";
  const listningGif = document.getElementById("listening_gif");
  listningGif.style.display = "flex";
}
//Hide listening dialog
function hideListeningDialog() {
  const listningGif = document.getElementById("listening_gif");
  listningGif.style.display = "none";
}
//Show waiting dialog
function showWaitingForServerDialog() {
  const server_wait = document.getElementById("waiting_gif");
  server_wait.style.display = "flex";
}
//Hide waiting dialog
function hideWaitingForServerDialog() {
  const server_wait = document.getElementById("waiting_gif");
  server_wait.style.display = "none";
}
//Open Portal
function openPortal(passableData) {
  const current = document.getElementById("login_page");
  current.style.display = "none";
  const portal = document.getElementById("scrollable_view");
  portal.style.display = "block";
}

//Show Success Popup
function showSuccessPopup(successMessage, timeout) {
  var successPopup = document.getElementById("successPopup");
  const success_holder = document.querySelector("#successPopup > p");
  success_holder.textContent = successMessage;
  successPopup.classList.add("show");
  setTimeout(function () {
    hideSuccessPopup();
  }, timeout);
}
//Show Error Popup
function showErrorPopup(errorMessage) {
  var errorPopup = document.getElementById("errorPopup");
  const error_holder = document.querySelector("#errorPopup > p");
  error_holder.textContent = errorMessage;
  errorPopup.classList.add("show"); // Add the 'show' class to display the popup
  setTimeout(function () {
    hideErrorPopup(); // Hide the popup after 3 seconds (adjust as needed)
  }, 3000); // 3000 milliseconds = 3 seconds
}
//Hide Popup like listening and answer view...
function hidePopup() {
  var popup = document.getElementById("pop-up");
  var waiting_gif = document.getElementById("waiting_gif");
  var listening_gif = document.getElementById("listening_gif");
  waiting_gif.style.display = "none";
  listening_gif.style.display = "none";
  popup.style.display = "none";
}
// Hide Error Popup
function hideErrorPopup() {
  var errorPopup = document.getElementById("errorPopup");
  errorPopup.classList.remove("show"); // Remove the 'show' class to hide the popup
}
function hideSuccessPopup() {
  var successPopup = document.getElementById("successPopup");
  successPopup.classList.remove("show");
}
//--------------------------------------END OF VIEW MANIPULATION CODE --------------------------------------
//--------------------------------------Data Layer Code--------------------------------------------------
//Script loginLoader
//Client Business Logic Code starts below............................................
//Register Process ..
const register = async function (user_data) {
  //console.log(JSON.stringify(user_data));
  return fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user_data),
  })
    .then((response) => {
      //console.log(response);
      if (response.ok) return response.json();
      throw new Error("Network Response is not ok");
    })
    .then((data) => {
      if (data && data["auth_id"] == "") {
        //console.log(data["auth_id"]);
        return "";
      } else return data["auth_id"];
    })
    .catch((e) => {
      localStorage.setItem("error", e);
    });
};
//Authentication Process .....
const authenticate = async function (data) {
 // console.group("Client Auth Interface");
  
  return fetch("/authenticate", {
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
    .then((data) => {
      //console.log(data);
      //console.groupEnd("Client Auth Interface");
      if (!data['is_authenticated']) return "Not Registered! Please Sign In!";
      else if(data['is_authenticated']){
        if(!data['allowed'])
        {
          return "You are not authorised! Contact 7999733632 Aniket Poptani";
        }
        else{
        auth_id = data["auth_id"];
        return {'auth_id':data["auth_id"],'allowed':data["allowed"]};
        }
      }
      
    })
    .catch((e) => {
      localStorage.setItem("error", e);
    });
};
function removeLoadedScript() {
  const scripts = document.head.getElementsByTagName("script");
  for (let script of scripts) document.head.removeChild(script);
}
function closeSocketConnection(){
  socket_handler.disconnect();
}
function removeKeyEventListeners() {
  document.removeEventListener("keydown", keyDownEvent);
  document.removeEventListener("keyup", keyUpEvent);
}
//Load Script for Recorder API and Socket API
function loadScript(url, callback) {
  if (url == null || url == undefined) {
    console.error("Url is undefined or null");
    return;
  }
  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  script.onload = callback;

  document.head.appendChild(script);
}
//Recording API loginLoader using auth_key
function getRecordingAPI(auth_key) {
  if (auth_key == null || auth_key == undefined) {
    console.error(
      "Real time connection initaited but with null or undefined auth_key"
    );
    return;
  }
  const auth_id = new URLSearchParams();
  auth_id.append("okta", auth_key);
 // console.log("Message Auth Id", auth_id);
  fetch(`/recorderApi?${auth_id}`, {
    method: "GET",
  })
    .then((response) => {
      response.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob);
        loadScript(url, () => {
          console.log("Recorder Initiated!");
        });
      });
    })
    .catch((e) => {
      console.error(e);
    });
}
//Socket Connection intiation
function initiateSocketConnection() {
  socket_handler = io();
}
//Socket Files loginLoader using the auth_key
function initiateRealTimeConnection(auth_key) {
  if (auth_key == null || auth_key == undefined) {
    console.error(
      "Real time connection initaited but with null or undefined auth_key"
    );
    return;
  }
  const auth_id = new URLSearchParams(auth_key).toString();
  fetch(`/socket.io/socket.io.js?${auth_id}`)
    .then((response) => {
      response.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob);
        loadScript(url, () => {
          initiateSocketConnection();
          bindSocket();
        });
      });
    })
    .catch((e) => {
      console.error(
        "Error while trying to get connection files from server..",
        e
      );
    });
}
function displayTableData(list) {
  gridHolder = document.getElementById("table_view");
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
    autoHeight: true,
    autoSizeStrategy: {
      type: "fitGridWidth",
      defaultMinWidth: 100,
      columnLimits: [
        {
          colId: "timestamp",
          minWidth: 300,
        },
        { colId: "delete", maxWidth: 10 },
      ],
    },
  };
  showTableData(list);
}
//Multi Part HTTP data transfer process postingd data as FormData through Promise Chaining
function transferMultiPartData(auth_id, data) {
  var formdata = new FormData();
  hideListeningDialog();
  showWaitingForServerDialog();
  formdata.append("audio", data, "user_audio.mp3");
  //formdata.forEach.apply((param) => console.log(param));
  fetch("/processAudioCommand", {
    method: "POST",
    body: formdata,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Response is not ok");
      } else {
        return response.json();
      }
    })
    .then((dataP) => {
      const len = Object.keys(dataP).length;
      let date = new Date(Date.now());
      let datePart = date.toISOString().split("T")[0];
      let timePart = date.toISOString().split("T")[1].split("Z")[0];
      let sqlDateTimeFormat = datePart + " " + timePart;
      dataP["timestamp"] = sqlDateTimeFormat;
      //console.log(dataP);
      //console.log(len);
      if (len && len > 0) {
        displayProcessedAnswer(auth_id, dataP);
      } else {
        console.error("result from server not properly formatted");
      }
      //console.groupEnd("Audio Transfer Process");
    })
    .catch((e) => {
      console.error(e);
      //console.groupEnd("Audio Transfer Process");
    });
}
//Submit the email and password for authentication
function submitForm(email, pass) {
  //localStorage.setItem('ft', 'fuvh');
  return authenticate({ email: email, password: pass });
}
function submitRegistration(data) {
  return register(data);
}
function logoutUser() {
  if (auth_id != null) {
    const portal = document.getElementById("scrollable_view");
    portal.style.display = "none";
    totalTodaysRevenueTxt.innerText = "---";
    totalRevenueTxt.innerText = "---";
    avgDiscountTxt.innerText = "---";
    const login = document.getElementById("login_page");
    login.style.display = "block";
    const loginForm = document.getElementById("login_form");
    loginForm.style.display = "none";
    const loginLoader = document.getElementById("loginLoad");
    loginLoader.style.display = "block";
    fetch("/logoutUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_id: "" }),
    })
      .then((response) => {
        if (!response.ok) showError("Network Error");
        return response.json();
      })
      .then((serverNote) => {
        console.log(`Message from Server`, serverNote["message"]);
        if (serverNote["code"] == 1) {
          loginLoader.style.display = "none";
          loginForm.style.display = "block";
          loginForm.reset();
          auth_id = null;
          removeLoadedScript();
          removeKeyEventListeners();
          closeSocketConnection();
          gridHolder.innerHTML = "";
          gridApi = null;
          gridHolder = null;
        }
      });
  }
}
//Check the vailidity of auth Token recived or used from the cached storage
function checkResults(result) {
  //console.log(typeof(result))
  if(typeof(result) != 'object')
  {
    return 102;
  }
  else{
    return 1;
  }
}
//Attach the keyEvents to listeners
function setUpAudioEvents() {
  document.addEventListener("keydown", keyDownEvent);
  document.addEventListener("keyup", keyUpEvent);
}
//Key Down Event to prevent continous function execution on key hold
function keyDownEvent(event) {
  if ((event.key == "Q" || event.key == "q") && !keyPressed && !isrecording) {
    keyPressed = true;
    isrecording = true;
    //console.group("RECORDING_API");
    showListeningDialog();
    Recorder.startRecording();
  }
}
//Key Up Event designed to prevent continous function execution on key hold
function keyUpEvent(event) {
  if ((event.key == "Q" || event.key == "q") && keyPressed && isrecording) {
    keyPressed = false;
    Recorder.stopRecording().then((audioBlob) => {
      isrecording = false;
      if (audioBlob == null || audioBlob == undefined) {
        console.error("Error while recording the audio...");
        //console.groupEnd("RECORDING_API");
      } else {
        //Send the blob as a multipart Form Data to the server for processing
        //console.groupEnd("RECORDING_API");
        //console.group("Audio Transfer Process");
        //console.log(auth_id);
        if (auth_id != null) transferMultiPartData(auth_id, audioBlob);
      }
    });
  }
}
//Utility function display red bar error at client side takes error string
function showError(errorString) {
  showErrorPopup(errorString);
 // console.error(errorString);
}
//Not using now
//Set up the functionality of sockets.....
//Not implemented right now
function bindSocket() {
  if (socket_handler == null) {
    console.error("Bind Socket called on null socket handle.");
    return;
  }
  socket_handler.emit("getSalesData", auth_id);
  totalRevenueTxt = document.getElementById("totalRevenueText");
  totalTodaysRevenueTxt = document.getElementById("dayRevenueText");
  avgDiscountTxt = document.getElementById("avgDiscountText");
  socket_handler.on("totalRevenueUpdate", (newRevenue) => {
    //Update View

    totalRevenueTxt.innerText = `Rs.${newRevenue}`;
  });
  socket_handler.on("totalTodaysRevenue", (data) => {
    totalTodaysRevenueTxt.innerText = `Rs.${data}`;
  });
  socket_handler.on("avgDiscount", (data) => {
    avgDiscountTxt.innerText = `Rs.${data}`;
  });
  socket_handler.on("avgRevenue", (data) => {});
  socket_handler.on("initialRecords", (data) => {
    if (data.isSuccess) {
      //console.log(data.list.constructor.toString());
      displayTableData(data.list);
    } else console.log("Data Retrieval Failed");
  });
  socket_handler.on("wrong_auth", (message) => {
    console.log(message);
  });
  socket_handler.on("dataUpdate", (change) => {
    //console.log("Update Got");
    if (change.operationType === "insert") {
      // Handle insert operation
      gridApi.applyTransaction({ add: [change.fullDocument] });
    } else if (change.operationType === "update") {
      // Handle update operation
      gridApi.applyTransaction({ update: [change.fullDocument] });
    } else if (change.operationType === "delete") {
      // Handle delete operation
      gridApi.applyTransaction({ remove: [change.documentKey] });
    }
  });
}
//Not implemented yet
function connectToRealTimeData(auth_key) {
  //Not Implemented
  console.log("Not Implemented yet");
}
//Not using Now
// const startFetchingData = () =>
//   fetch("/getData")
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         console.log(
//           "CLIENT END:: Server Response Error status:",
//           response.status
//         );
//         console.log(
//           "CLIENT END:: Server Response Error statusText:",
//           response.statusText
//         );
//         throw new Error("Response is not OK!");
//       }
//     })
//     .then((data) => {
//       //showTableData(data);
//       // startStreamingData();
//     })
//     .catch((error) => {
//       console.error("CLIENT END:: Server Data Fetch failed", error);
//     });
//Client Side Application Entry Point..........................................................
document.addEventListener("DOMContentLoaded", () => {
  // gridHolder = document.getElementById("table_view");
  // gridOptions = {
  //   columnDefs: columnDefination,
  //   defaultColDef: { sortable: true, filter: true, editable: true },
  //   rowData: [

  //   ],
  // };
  // //startFetchingData();
  // new agGrid.Grid(gridHolder, gridOptions);
  // const current = document.getElementById("login_page");
  // current.style.display = "none";
  //Instantiate the loading views...
  registerBtn = document.getElementById("registerHamBurger");
  aboutBtn = document.getElementById("aboutHamBurger");
  loginBtn = document.getElementById("loginHamBurger");
  logoutBtn = document.getElementById("logoutHamBurger");
  const loginLoader = document.getElementById("loginLoad");
  //Instantiate the login handler...
  const loginForm = document.getElementById("login_form");
  //loginForm.style.display = "none";
  const registerForm = document.getElementById("register_form");
  registerHolder = document.getElementById("register_page");
  loginHolder = document.getElementById("login_page");
  //Intiate them with expected behaviour loginLoader=none login-->displayed
  loginLoader.style.display = "none"; //enable by block
  //Attaching a submit action to the loginHolder form and overriding default submission process
  loginForm.addEventListener("submit", function (event) {
    //Prevent default Form Submission
    event.preventDefault();
    //Get email and password value from input fields of Form...
    var email = loginForm.elements["user_email"].value;
    var password = loginForm.elements["user_password"].value;
    //Display loading ....
    loginLoader.style.display = "block";
    //Hide the form....
    loginForm.style.display = "none";
    //Submit the form for custom execution....
    submitForm(email, password).then((response) => {
      //Check response validity....
      //console.log(typeof response);
      const res_code = checkResults(response);
      switch (res_code) {
        case 1:
          //Authentication success.....
          //Revert the views
          loginLoader.style.display = "none";
          loginForm.style.display = "block";
          //Open Portal with the auth id
          openPortal(response);
          initiateRealTimeConnection(response);
          //Get Recording API using auth_id
          //console.group("Recording API Loading Process");
          getRecordingAPI(response);
          //console.groupEnd("Recording API Loading Process");
          //Attach redorder api to events
          setUpAudioEvents();
          //Attach logout Action
          logoutBtn.classList.remove("hidden");
          logoutBtn.addEventListener("click", (event) => {
            logoutUser();
            logoutBtn.classList.add("hidden");
          });
          //Get and attach real time data service...
          //Not Implemented...
          //console.group("Socket Service Loading Process");
          // connectToRealTimeData(response);
          //console.groupEnd("Socket Service Loading Process");
          break;
        case 102:
          //Remove loading from view
          loginLoader.style.display = "none";
          //Show error
          showError(response);
          //Revert the login screen display
          loginForm.style.display = "block";
          break;  
        default:
          //Remove loading on network errors
          loginLoader.style.display = "none";
          //Show Error
          showError("{DEBUG}:Invalid data or null res_code");
          //Revet the login screen
          loginForm.style.display = "block";
      }
    });
  });
  const registerLoader = document.getElementById("registerLoad");
  registerLoader.style.display = "none";
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    //console.log("clicked");
    var email = registerForm.elements["r_user_email"].value;
    var password = registerForm.elements["r_user_password"].value;
    var name = registerForm.elements["user_name"].value;
    var phone = registerForm.elements["user_phone"].value;
    var address = registerForm.elements["user_address"].value;
    var data = {
      email: email,
      pass: password,
      name: name,
      phone: phone,
      address: address,
    };
    registerForm.style.display = "none";
    //Display loading ....
    registerLoader.style.display = "block";
    submitRegistration(data).then((response) => {
      //console.log(response);
      registerLoader.style.display = "none";
      registerForm.reset();
      registerForm.style.display = "";
    });
  });
  registerBtn.addEventListener("click", function (event) {
    loginHolder.style.display = "none";
    registerHolder.style.display = "block";
    registerBtn.style.display = "none";
    loginBtn.style.display = "block";
  });
  loginBtn.addEventListener("click", function (event) {
    registerHolder.style.display = "none";
    loginHolder.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "block";
    //logoutBtn.style.display = "block";
  });
});
