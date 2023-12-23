const google_library = require('@google-cloud/speech');
const { SpeechClient } = require('@google-cloud/speech/build/src/v1');
const speechClient = new google_library.SpeechClient();

async function serveRequest(audioBuffer){
    var request = {
        config: {
            encoding: "LINEAR16",
            model: "latest_long",
            sampleRateHertz: 48000,
            audioChannelCount: 2,
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
module.exports= [serveRequest];
