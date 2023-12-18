 class Database{
    constructor(database_type){
        if(this.constructor == Database)
         throw new Error("Unable to initiallize Abstract Class Database");
        this.database_type= database_type;
    }
    createConnection(){

    }
    defineConnectionStrings(){

    }
    provideMetaData(){

    }
    getJSONArray(){

    }
    batchUpdate(){

    }
    singleOperation(){

    }
    insertNewRecord(){

    }
    createNewUser(){

    }
    closeConnection(){
        
    }
    checkRegisteration(token_id){
    }
}
module.exports= Database;
