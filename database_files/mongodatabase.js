const Database= require('./databaseClass');
const { MongoClient, ServerApiVersion } = require('mongodb');
const token_lib= require('../token_files/getToken');
function checkDataAuthenticity(data,token){
    curr_token= token_lib.getToken(data);
    if (curr_token == token)
        return true
    else
        return false
}
class MongoDatabase extends Database{
    async createConnection(){
      try{  
       await this.client.connect();
       console.log('Database Connection Success');
      }
      catch(e){
        console.error('MongoDatabaseError::',e);
      } 
    }
    defineConnectionStrings(uri)
    {
       //Uri contains username and password  
       this.mongoURI= uri;
       this.strict= true;
       this.deprecationErrors= true;
       this.serverVersion= ServerApiVersion.v1;
       this.client= new MongoClient(uri, {
        serverApi:{
            version: this.serverVersion,
            strict: this.strict,
            deprecationErrors: this.deprecationErrors
        }
       }); 
       super.defineConnectionStrings(); 
    }
    provideMetaData(){
       this.databaseHandle= this.client.db('test');
       this.collection=  this.databaseHandle.collection('user');
       console.log('Database Connection Success');
       super.provideMetaData();
    }
    async getJSONArray(data){
     // console.log("Serving request for: ",token);
      const getFullDetailQuery= data;
      try{
        var answer= await this.collection.findOne(getFullDetailQuery);
        console.log(answer.email);     
        if(answer!==null)
           return answer;  
        else{
          console.log('No such record in the database',answer);
           return {};
        } 
      }
      catch(e){
        console.log('Error getting user details',e);
        return {'error':'Error Occured '};
      }  
    }
    batchUpdate(token, updates){
      console.log("Performing Batch Update for:", token);
      const filter_criteria= {
        token_id:token,
       
       };
      updates.forEach(async (data)=>{
        filter_criteria['sales_data.sales_id']=data.sales_id;
        updated_record= {$set:{'sales_data.$':data}};
        await this.collection.updateOne(filter_criteria,updated_record);
      });
    }
    singleOperation(){
      super.singleOperation();
    }
    async insertNewRecord(userdata){
      const data_to_insert = userdata ?? "NA";
      if(typeof data_to_insert == "string" ){
       console.log('Data is not valid ', typeof userdata);
       return -1;
      }
      else{
        if(checkDataAuthenticity(userdata,userdata.token)){
          console.log('Data was compromised in transit.. Ignoring Save Operation');
          return 202;
        }
        else{
          data_to_insert.sales_data= [];
          const result = await this.collection.insertOne(data_to_insert);
          return 1;
        }
      }
       
      
    }
    //Not needed
    createNewUser(){
      super.createNewUser();
    }
    async closeConnection(){
        await this.client.close();
    }
    async checkRegistration(data){
    try {
        console.log('Data recived ',data);
        const document = await this.collection.findOne(data);
        if(document === null)
         return ({isRegistered:false, auth_id:''});
        else if(document === undefined)
          return {isRegistered:false, auth_id:''};
        else{
         console.log(document.token);
         return ({isRegistered:true, auth_id: document.token});
        } 
      } catch (error) {
        console.error(error)
        return {isRegistered:false, auth_id:''};
      }
  }

}
module.exports= MongoDatabase;
