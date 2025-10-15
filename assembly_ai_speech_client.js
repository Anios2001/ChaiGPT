
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "69b2973876a044e98d324169c1e0e12f",
});

const audioFile = ''

const params = {
  audio: audioFile,
  speech_model: "universal",
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  console.log(transcript.text);
};

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

export async function getAnswer(path){
  try{
      // const buffer= await readFileAsync(path);
      // const base64buffer= buffer.toString('base64');
      // //send for google speech recog
      // const text = await serveRequest(base64buffer);
      const params = {
        audio: path,
        speaker_labels: true,
        format_text: true,
        punctuate: true,
        speech_model: "universal",
        language_code: "hi"
      };
      const transcribe = await client.transcripts.transcribe(params);
      console.log(transcribe.text);
      return transcribe.text;
  }
  catch(e){
      console.error(e);
      return '';
  }    
}

// getAnswer("audio_files/66d15dcd5d07237fd99fb24f5b2fe236.mp3")