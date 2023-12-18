const {MongoClient, ChangeStream}= require('mongodb');
var databaseHandle= null;
async function getTableofVendorData(database_handle){   
    const query= {};
    const dataDocs = await database_handle.collection('user').find(query).toArray();
    console.log('Retrieved documents:\n');
    console.log(dataDocs);
    
    return dataDocs;
}
async function getChangeStreams (){
    const query= {};
    const dataChangeStream = await databaseHandle.collection('user').watch({ $match: { operationType: "insert" } },{
        $project: {
          "fullDocument.vendor_name": 1,
          "fullDocument.rate_per_kg": 1,
        },
      },);
    console.log('Retrieved Change of document:\n');
    console.log(dataChangeStream);
    return dataChangeStream;
}
async function connectToDatabase(databaseURI){
    const URI= databaseURI;
    const client = new MongoClient(URI);

    try{
        await client.connect();
        // console.log("database connection successfull....")
        databaseHandle= client.db('test');
        // Database operations start here 
        return databaseHandle;
    }
    catch(error){
        console.error("database connection error :",error);
        return databaseHandle;
    }
    finally{
        //await client.close();
        // console.log(table_Data);
    }
}

async function getData(){
    var times= 1;
    const databaseAddress= "mongodb+srv://anipoptani123:cXYafEPb5VSmwmKU@cluster0.01ewbcd.mongodb.net/?retryWrites=true&w=majority";
    dataHandle=  await connectToDatabase(databaseAddress); 
    // while(dataHandle == null && times<=5){
    //     console.log(```Tried ${times} time(s) to connect with the database at ${databaseAddress} , but failed... Check connection ```);
    //     dataHandle= await connectToDatabase(databaseAddress);  
    //     times++;
    // }
    if(dataHandle == null){
        console.error("[CRITICAL ALERT] Unable to connect to Mongo DB data store... even after 5 tries..")
        return null;
    }
    else{
       console.log("Database Connection Successfull!!");
       const dataDocuments= await getTableofVendorData(dataHandle);
       return dataDocuments;
    }
    
}
module.exports = {getData, getChangeStreams};