const google_library = require('@google-cloud/speech');
const { SpeechClient } = require('@google-cloud/speech/build/src/v1');
const fs= require('fs');
const util= require('util');
const readFileAsync= util.promisify(fs.readFile);
const speechClient = new google_library.SpeechClient();

async function serveRequest(audioBuffer){
    var request = {
        config: {
            encoding: "MP3",
            model: "latest_long",
            sampleRateHertz: 48000,
            audio_channel_count:2,
            enableWordTimeOffsets: true,
            enableWordConfidence: true,
            languageCode: "en-IN",
        },
        interimResults: false,
        audio:{
            content: audioBuffer,
        }
    };
    const [response]= await speechClient.recognize(request);
    const transcription = response.results.map(result=>result.alternatives[0].transcript)
    .join('\n');
    return transcription;   

}
async function getAnswer(path){
try{
    const buffer= await readFileAsync(path);
    const base64buffer= buffer.toString('base64');
    //send for google speech recog
    const text = await serveRequest(base64buffer);
    console.log(text);
    return text;
}
catch(e){
    console.error(e);
    return '';
}    
}
module.exports= {getAnswer};

