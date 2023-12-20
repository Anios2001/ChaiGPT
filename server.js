//need an node.js environment to run 
// This is an application server for my node.js application 
// database service loaded as a function library....

//Request Response Channel Requirements
const express= require('express');
const path= require('path');
const http= require('http');
//Socket Connection Requirement
const socket= require('socket.io');
//Token Server Requirement
const tokenGenerator= require('./token_files/getToken');
// Database Library 
const MongoDatabase= require('./database_files/mongodatabase');
var databaseInstance;
//Server Configuration Code 
const app = express();
const port= 8000;
//creating a HTTP Request Response Server on app thread
const streamingServer = http.createServer(app);
//register the static files to serve

app.use(express.static(path.join(__dirname, '')));
app.use(express.json());
//register the server endpoints
//register user-------------------
app.post('/register',async (req,res)=>{
  
  const user_data= req.body;
  console.log('Recived Request ',user_data);
 if(user_data!== undefined)
 {
  const json= user_data;
  const token= tokenGenerator.getToken({email:json.email,password:json.password});
  var data_to_server= user_data;
  data_to_server.token= token;
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
    }
    else{
      res.send({msg:'Server error :: database object is null or not instantiated... '});
    }
 }
 else{
     res.send({msg:'Server recived an empty string'});
 }  
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
   
   //getToken
   //const auth_token= tokenGenerator.getToken(auth_data);
   //console.log(auth_token)   
//check User Registered or not
   //console.log(auth_data);
   var result= await databaseInstance.checkRegistration(auth_data);
   if(result.isRegistered)
    res.json({'auth_id':result.token,is_authenticated:true});
   else
    res.json({'auth_id':'',is_authenticated:false});
   

});
app.get('/initSocketConnection', async (req, res)=>{
  connection = initiateSocketConnection();
  connection.on('connection', (c_id)=>{
      console.log('User Connected');

      c_id.on('/getSalesData',  (auth_strings)=>{
         const data= databaseInstance.getData(auth_strings['auth_id'])
         connection.emit('s_data',data);
      });
      c_id.on('/suscribeForUpdates', (auth_strings)=>{
         
      });
  })
});
//function to start Socket Connection
function initiateSocketConnection(){
   return socket(streamingServer);
}
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
