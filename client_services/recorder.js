// Recorder API
var audioRecorder = {
    audioBlobs:[],
    streamBeingCaptured: null,
    mediaRecorder:null,  
    start: async function () {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    return Promise.reject(new Error('mediaDevicesAPI or getUserMedia is not supported on this browser'));
  }

  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    this.streamBeingCaptured = stream;
    this.audioBlobs = []; // fresh array
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.addEventListener('dataavailable', event => {
      if (event.data && event.data.size > 0) {
        this.audioBlobs.push(event.data);
      }
    });
    this.mediaRecorder.start();
  });
},
    stop: function () {
  return new Promise(resolve => {
    if (!this.mediaRecorder) {
      resolve(null);
      return;
    }

    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

    this.mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(this.audioBlobs, { type: mimeType });
      console.log('Blob size:', audioBlob.size);
      this.stopStream();
      this.resetRecordingProperties();
      resolve(audioBlob);
    });

    try {
      this.mediaRecorder.stop();
    } catch (err) {
      console.error('Error stopping mediaRecorder:', err);
      this.stopStream();
      this.resetRecordingProperties();
      resolve(null);
    }
  });
},

    cancel: function (){
  
    },
    resetRecordingProperties: function (){
      this.mediaRecorder= null;
      this.streamBeingCaptured= null;
      this.audioBlobs=[];
    },
    stopStream: function (){
      this.streamBeingCaptured.getTracks().forEach(track => {
          track.stop();
      });
    },
    
  };
function startRecording(){
    audioRecorder.start().then(()=>{
        console.log("Started to record.....");
    }).catch((error)=>{
        if(error.message.includes('mediaDevicesAPI or getUserMedia is not supported on this browser')){
            console.log('Please use FireFox or Chrome for accessing the page');
        }
        else{
            switch(error.name){
            case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                console.log("An AbortError has occured.");
                break;
            case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                console.log("A NotAllowedError has occured. User might have denied permission.");
                break;
            case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                console.log("A NotFoundError has occured.");
                break;
            case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                console.log("A NotReadableError has occured.");
                break;
            case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                console.log("A SecurityError has occured.");
                break;
            case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                console.log("A TypeError has occured.");
                break;
            case 'InvalidStateError': //error from the MediaRecorder.start
                console.log("An InvalidStateError has occured.");
                break;
            case 'UnknownError': //error from the MediaRecorder.start
                console.log("An UnknownError has occured.");
                break;
            default:
                console.log("An error occured with the error name " + error.name);
            }
        }
    });
}
async function stopRecording(){
  try{
    const audioAsBlob = await audioRecorder.stop();
    if (!audioAsBlob) {
      console.error('stop() returned no Blob.');
      return null;
    }
    if (!(audioAsBlob instanceof Blob)) {
      console.error('Returned value is not a Blob:', audioAsBlob);
      return null;
    }

    const url = URL.createObjectURL(audioAsBlob);
    const audioElement = new Audio(url);
    audioElement.onended = () => URL.revokeObjectURL(url); // free memory
    await audioElement.play();
    return audioAsBlob;
  } catch(error){
    console.error('Error in stopRecording:', error);
    return null;
  }
}

window.Recorder= {
    startRecording,
    stopRecording
};
  
