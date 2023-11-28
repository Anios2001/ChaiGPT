const os = require('os');
const path = require('path');
const uniqueIDs= require('uuid');
const file_system_extra= require('fs-extra');


async function saveFile(file){
   try{
    const temporaryDir= os.tmpdir();
    const fileNamewithExtension= file.name;
    const uniqueID= uniqueIDs.v4();
    const uniqueFileName= ```${uniqueID}_${fileNamewithExtension}```;
    const filePath= path.join(temporaryDir,uniqueFileName);
    file_system_extra.writeFile(filePath, file.buffer);
    return filePath;   
   }
   catch(e){
     console.error("Error during file save operation", e);
     throw error;
   }
} 

module.exports= {saveFile};