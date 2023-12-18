const MongoDatabase= require('./mongodatabase');
var databaseInstance;
async function a(){
databaseInstance = new MongoDatabase();
databaseInstance.defineConnectionStrings('mongodb+srv://anipoptani123:cXYafEPb5VSmwmKU@cluster0.01ewbcd.mongodb.net/?retryWrites=true&w=majority');
await databaseInstance.createConnection();
databaseInstance.provideMetaData();
const t=  databaseInstance.checkRegistration({'email':'aniketpoptani100@gmail.com'});
console.log(t);
}
a();
