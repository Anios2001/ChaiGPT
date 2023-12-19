const express= require('express');
const path= require('path');
const http= require('http');
const app = express();
const port= 8000;
const streamingServer = http.createServer(app);
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());

app.post('/auth',(req, res)=>{
    console.log(req.body);
    return 'Request Served.....';
});

streamingServer.listen(port, ()=>{
  console.log('Started to listen on porr', port);
});