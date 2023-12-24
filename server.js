//need an node.js environment to run 
// This is an application server for my node.js application 
// database service loaded as a function library....

//Request Response Channel Requirements
const express= require('express');
const path= require('path');
const http= require('http');
const fs= require('fs');
const util= require('util');
const writeFileAsync= util.promisify(fs.writeFile);
const readFileAsync= util.promisify(fs.readFile);
//Socket Connection Requirement
const socket= require('socket.io');
//Token Server Requirement
const tokenGenerator= require('./token_files/getToken');
// Database Library 
const MongoDatabase= require('./database_files/mongodatabase');
const {getAnswer} = require('./google_speech_client');
const {getGeneration} = require('./generationFiles/textGeneration');
const multer= require('multer');
const uploader= multer({dest: 'audio_files/'});
var databaseInstance;
//Server Configuration Code 
const app = express();
const port= 8000;
//creating a HTTP Request Response Server on app thread
const streamingServer = http.createServer(app);
//register the static files to serve
const socketServices= socket(streamingServer);
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());
//Client Socket File Distribution Request
//Required for socket functionality  
app.get('/socket.io/socket.io.js', (req, res)=>{
  const auth_id= req.query;
  var isApproved= databaseInstance.checkMemberShip(auth_id);
  if(isApproved){
    res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
  }
  else{
    res.send('Your are not authorised to use the services... contact 7999733632');
  }
});
app.get('/recorderApi', (req, res)=>{
  const auth_id= req.query;
  //use auth id to track usage now 
  console.group("Serving Recorder API");
  var isApproved= databaseInstance.checkMemberShip(auth_id);
  if(isApproved){
    console.log(`Auth id approved :${auth_id}:`);
    res.sendFile(__dirname + '/client_services/recorder.js',(result)=>{
      
      console.groupEnd("Serving Recorder API");
    });  
  }
  else{
    console.log(`The auth id is not approved :${auth_id}:`);
    console.groupEnd("Serving Recorder API");
    res.send('Your are not authorised to use the services... contact 7999733632');
  }
});
//register the server endpoints
//register user-------------------
app.post('/register',async (req,res)=>{
  
  const user_data= req.body;
  console.group("Serving Register request");
  console.log('Recived Request ',user_data);
 if(user_data!== undefined)
 {
  const json= user_data;
  const token= tokenGenerator.getToken({email:json.email,password:json.password});
  var data_to_server= user_data;
  data_to_server.token= token;
  try{
    if (databaseInstance) {
      var code = await databaseInstance.insertNewRecord(data_to_server);
      switch(code){
        case 1:
          res.json({auth_id:token});
          break;
        case -1:
          res.send({msg:'Data is not valid'});
          break;
        default:
          res.send({msg:'Data Authenticity violated....'});
        }    
      console.groupEnd("Serving Register request");  
    }
    else{
      console.log("Data base instance null");
      res.send({msg:'Server error :: database object is null or not instantiated... '});
      console.groupEnd("Server Register request");
    }
  }
  catch(e){
    console.log("Error while inserting new record");
    console.groupEnd("Server Register request");
  } 
 }
 else{
     res.send({msg:'Server recived an empty string'});
     console.groupEnd("Server Register request");
 }  
});
//get the Audio File for processing 
app.post('/processAudioCommand',uploader.single('audio'), async (req, res)=>{
  console.group("Serving Audio Command Request");
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log(req.file);
  const audioFile= req.file;
  try{
 
  const fileBuffer= await readFileAsync(audioFile.path);

  await writeFileAsync(`audio_files//${audioFile.filename}.mp3`,fileBuffer);
  fs.unlinkSync(audioFile.path);
  // //send for google speech recog
  const text = await getAnswer(`audio_files//${audioFile.filename}.mp3`);
  // //answer to my own GPT command 
  const generation = await getGeneration(text);
  
  res.json(JSON.parse(generation));
  }
  catch(e){
    console.error(e);
  }
  console.groupEnd("Serving Audio Command Request");
  
});
//2 getDataStream ---------
app.get('/getDataStream', async (req,res)=>{
//  dataLoader.getChangeStreams().then((result)=>{
//     const connectionSocket= initiateSocketConnection();
//     result.on('change', change =>{
//        connectionSocket.emit('dataUpdate',change);  
//     });
//  }); 
});
//3 authenticate user using email and password
app.post('/authenticate', async (req,res)=>{
   const auth_data= req.body;
   console.group("Serving Authenticate Request");
   console.log('Auth Request ');
   
   var result= await databaseInstance.checkRegistration(auth_data);
   if(result.isRegistered){
    console.log(result.auth_id);
    res.json({auth_id:result.auth_id,is_authenticated:true});
   }
   else
    res.json({auth_id:'',is_authenticated:false});
   console.groupEnd("Serving Authenticate Request");

});

var socketConnections= 0;   
socketServices.on('connection', (c_id)=>{
    socketConnections+=1;
    console.log(`A user connected via socket.... ${socketConnections} concurrent connection(s)`);
    c_id.on('/getSalesData',  (auth_strings)=>{
        //Get Sales data updates in real time 
    });
    c_id.on('/suscribeForUpdates', (auth_strings)=>{
        //Implement real time updates 
    });
})

//start listening for user request and responses
//listen on all the interfaces for connections 
streamingServer.listen(port,async ()=>{
    console.log(`Listening on port: `,port);
   //  const socket= initiateSocketConnection();
    databaseInstance = new MongoDatabase();
    databaseInstance.defineConnectionStrings('mongodb+srv://anipoptani123:cXYafEPb5VSmwmKU@cluster0.01ewbcd.mongodb.net/?retryWrites=true&w=majority');
    await databaseInstance.createConnection();
    databaseInstance.provideMetaData();
});
