//need an node.js environment to run
// This is an application server for node.js application
// database service loaded as a function library....
//Request Response Channel Requirements
//For Express MiddleWare and initiating the application environment
const express = require("express");
//for path.join(_dirname,'') All request must point to files in the directory
const path = require("path");
// creating a server using http.createServer(<Application context>)
const http = require("http");
// file input and output operations using filesystem node.js library fs
const fs = require("fs");
//Converting the Promise Chaining to async/await type for better management of code
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
//Socket Connection Requirement
const socket = require("socket.io");
//Token Server Requirement
const tokenGenerator = require("./token_files/getToken");
// Database Library
const MongoDatabase = require("./database_files/mongodatabase");
const RedisDataBase = require("./database_files/redisDatabase");
const SQLDatabase = require("./database_files/sqldatabase");
// Google Speech to Text
const { getAnswer } = require("./google_speech_client");
// GPT generation Library
const {
  initiateOpenAI,
  getGeneration,
  getGenerationDummy,
} = require("./generationFiles/textGeneration");
// For transfering audio data using the http formData, audio is a multipart data
const multer = require("multer");
const { json } = require("stream/consumers");

//-----------------------dependencies declaration ended------------------------------------------------------------------
//Intializing multipart multer to save file at dest defined using a json
const uploader = multer({ dest: "audio_files/" });
//database Handler
var databaseInstance;
//Server Configuration Code
const app = express();
const port = 8000;
//creating a HTTP Request Response Server on app thread/context
const streamingServer = http.createServer(app);
//converting the server into socket server by using socket constructor with server as attribute
const socketServices = socket(streamingServer);
//register the static files to serve using express middleware express.static
app.use(express.static(path.join(__dirname, "")));
// register json format to be used for incoming requests only not responses
app.use(express.json());
//Socket connector distribution code
//Required for socket functionality....
app.get("/socket.io/socket.io.js", (req, res) => {
  const auth_id = req.query;
  var isApproved = databaseInstance.checkMemberShip(auth_id);
  if (isApproved) {
    res.sendFile(
      __dirname + "/node_modules/socket.io/client-dist/socket.io.js"
    );
  } else {
    res.send(
      "Your are not authorised to use the services... contact 7999733632"
    );
  }
});
//Recorder Api distribution code
app.get("/recorderApi", async (req, res) => {
  const auth_id = req.query["okta"];
  //use auth id to track usage now
  console.group("Serving Recorder API");
  var isApproved = await databaseInstance.checkMemberShip(auth_id);
  console.log(isApproved);
  if (isApproved) {
    console.log(`Auth id approved :${auth_id}:`);
    res.sendFile(__dirname + "/client_services/recorder.js", (result) => {
      console.groupEnd("Serving Recorder API");
    });
  } else {
    console.log(`The auth id is not approved :${auth_id}:`);
    console.groupEnd("Serving Recorder API");
    res.send(
      "Your are not authorised to use the services... contact 7999733632"
    );
  }
});
app.post("/logoutUser", (req, res) => {
  const authIDLogout = Object.keys(req)[0] ?? null;
  if (authIDLogout != null) {
    res.json({ message: "Successfully Logged  Out", code: 1 });
  } else res.json({ message: "The request is null", code: -1 });
});
//Open server endpoints...
// 1 register user-------------------
app.post("/register", async (req, res) => {
  const user_data = req.body;
  console.group("Serving Register request");
  console.log("Recived Request ", user_data);
  if (user_data !== undefined) {
    const passwordHash = await tokenGenerator.getCrypticHash(user_data.pass);
    user_data.pass = passwordHash;
    console.log("After Hash", user_data);
    const json = user_data;
    const token = tokenGenerator.getToken({
      email: json.email,
      password: json.pass,
    });
    var data_to_server = user_data;
    data_to_server.token = token;
    try {
      if (databaseInstance) {
        var code = await databaseInstance.createNewUser(data_to_server);
        switch (code) {
          case 1:
            res.json({ auth_id: token });
            break;
          case -1:
            res.send({ msg: "Data is not valid" });
            break;
          default:
            res.send({ msg: "Data Authenticity violated...." });
        }
        console.groupEnd("Serving Register request");
      } else {
        console.log("Database instance null");
        res.send({
          msg: "Server error :: database object is null or not instantiated... ",
        });
        console.groupEnd("Server Register request");
      }
    } catch (e) {
      console.log("Error while inserting new record", e);
      console.groupEnd("Server Register request");
    }
  } else {
    res.send({ msg: "Server recived an empty string" });
    console.groupEnd("Server Register request");
  }
});
app.post("/addSalesRecord", async (req, res) => {
  console.log(req.body);
  const jsonBody = req.body;
  console.group("Serving addSalesRecord request");
  console.log("Request from", jsonBody.auth_id);
  const result = await databaseInstance.singleOperation(
    jsonBody.auth_id,
    jsonBody.record
  );
  if (Object.keys(result).includes("sale_id")) {
    console.log(`Added Sales record with id ${result["sale_id"]}`);
    socketServices.emit("dataUpdate", {
      operationType: "insert",
      fullDocument: result,
    });
    const newRevenue = await databaseInstance.sumColumnRows(
      "net",
      jsonBody.auth_id
    );

    // let timePart = date.toISOString().split("T")[1].split("Z")[0];

    const todaysRevenue = await databaseInstance.sumTodaysColumnValue(
      "net",
      jsonBody.auth_id
    );
    const avgDiscount = await databaseInstance.avgColumnRows(
      "discount",
      jsonBody.auth_id
    );
    socketServices.emit("avgDiscount", avgDiscount);
    socketServices.emit("totalTodaysRevenue", todaysRevenue);
    socketServices.emit("totalRevenueUpdate", newRevenue);
    res.json({ code: 1 });
  } else {
    console.log(
      `Error Ocurred while storing sales record for ${jsonBody.auth_id} errDes: ${result["error"]}`
    );
    res.json({ code: -1 });
  }
});
// 2 get the Audio File for processing
app.post("/processAudioCommand", uploader.single("audio"), async (req, res) => {
  console.group("Serving Audio Command Request");
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log(req.file);
  const audioFile = req.file;
  try {
    console.log("File Path", audioFile.path);
    const fileBuffer = await readFileAsync(audioFile.path);

    await writeFileAsync(`audio_files//${audioFile.filename}.mp3`, fileBuffer);
    fs.unlinkSync(audioFile.path);
    // //send for google speech recog
    const text = await getAnswer(`audio_files//${audioFile.filename}.mp3`);
    // //answer to my own GPT command
    await initiateOpenAI();
    const generation = await getGeneration(text);
    const generationJSON = JSON.parse(generation);
    console.log(generationJSON);
    res.json(generationJSON);
  } catch (e) {
    console.error(e);
  }
  console.groupEnd("Serving Audio Command Request");
});
// getDataStream ---------
app.get("/getDataStream", async (req, res) => {
  //  dataLoader.getChangeStreams().then((result)=>{
  //     const connectionSocket= initiateSocketConnection();
  //     result.on('change', change =>{
  //        connectionSocket.emit('dataUpdate',change);
  //     });
  //  });
});
//3 authenticate user using email and password
app.post("/authenticate", async (req, res) => {
  const auth_data = req.body;
  console.group("Serving Authenticate Request");
  console.log("Auth Request ");

  var result = await databaseInstance.checkRegisteration(auth_data);
  if (result.isRegistered) {
    console.log(result.auth_id);
    res.json({ auth_id: result.auth_id, is_authenticated: true });
  } else res.json({ auth_id: "", is_authenticated: false });
  console.groupEnd("Serving Authenticate Request");
});
//Socket connection handlers registration.....
var socketConnections = 0;
socketServices.on("connection", (c_id) => {
  socketConnections += 1;
  console.log(
    `A user connected via socket.... ${socketConnections} concurrent connection(s)`
  );
  c_id.on("deleteSaleRecord", async (recordData) => {
    var authCheck = await databaseInstance.checkMemberShip(recordData.user_id);
    if (authCheck) {
      var deleted = await databaseInstance.deleteRecord(
        recordData.sale_id,
        recordData.user_id
      );
      console.log(deleted);
      if (deleted) {
        const newRevenue = await databaseInstance.sumColumnRows(
          "net",
          recordData.user_id
        );
        socketServices.emit("totalRevenueUpdate", newRevenue);
        socketServices.emit("deletionComplete", recordData);
      } else socketServices.emit("deletionFailed", recordData);
    }
  });
  c_id.on("getSalesData", async (auth_strings) => {
    //Get Sales data updates in real time
    console.group("Serving Real Time Updates");
    var result = await databaseInstance.checkMemberShip(auth_strings);
    if (result == true) {
      console.log("Real Time Update Loop Approved");
      var sale_records = await databaseInstance.getSaleRecords(auth_strings);
      var totalRevenue = await databaseInstance.sumColumnRows(
        "net",
        auth_strings
      );

      // let timePart = date.toISOString().split("T")[1].split("Z")[0];

      const todaysRevenue = await databaseInstance.sumTodaysColumnValue(
        "net",
        auth_strings
      );
      const avgDiscount = await databaseInstance.avgColumnRows(
        "discount",
        auth_strings
      );
      socketServices.emit("avgDiscount", avgDiscount);
      socketServices.emit("totalTodaysRevenue", todaysRevenue);

      socketServices.emit("totalRevenueUpdate", totalRevenue);
      socketServices.emit("initialRecords", sale_records);
    } else socketServices.emit("wrong_auth", "User not registered");
  });
});
//Start the server on port specified above....
//start listening for user request and responses
//listen on all the interfaces for connections
streamingServer.listen(port, async () => {
  console.log(`Listening on port: `, port);
  //  const socket= initiateSocketConnection();
  databaseInstance = new SQLDatabase();
  // databaseInstance.defineConnectionStrings(
  //   "mongodb+srv://anipoptani123:1tOlp7JOrehLiWeF@cluster0.01ewbcd.mongodb.net/?retryWrites=true&w=majority"
  // );
  databaseInstance.defineConnectionStrings();
  databaseInstance.createConnection();
  //await databaseInstance.testConnection();
  databaseInstance.provideMetaData();
});
