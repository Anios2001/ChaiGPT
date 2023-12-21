//Recorder API
var audioRecorder = {
    audioBlobs:[],
    streamBeingCaptured: null,
    mediaRecorder:null,  
    start: async function (){
       if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
          return Promise.reject(new Error('mediaDevicesAPI or getUserMedia is not supported on this browser'));
       }
       else{
          return navigator.mediaDevices.getUserMedia({audio: true}).then((stream)=>{
            //Intialize the api data vars
            this.streamBeingCaptured= stream;
            this.mediaRecorder= new MediaRecorder(stream);
  
            this.mediaRecorder.addEventListener('dataavailable', event =>{
                 this.audioBlobs.push(event.data);
            });
  
            this.mediaRecorder.start();
  
          });
       }
    },
    stop: function (){
          return new Promise(resolve =>{
              let mimeType= this.mediaRecorder.mimeType;
              console.log(mimeType)
              this.mediaRecorder.addEventListener('stop',()=>{
                  let audioBlob= new Blob(this.audioBlobs,{type: mimeType});
                  resolve(audioBlob);
              });
              this.mediaRecorder.stop();
              this.stopStream();
              this.resetRecordingProperties();
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
function stopRecording(){
    audioRecorder.stop().then(audioAsBlob =>{
      window.sendAudioBlob(audioAsBlob);
      let audioElement= new Audio(URL.createObjectURL(audioAsBlob));

      console.log('Stopped Recording and Blob created',audioAsBlob);
      console.log('Playing the blob... ');
      audioElement.play();
      
    })
    .catch((error)=>{
        switch(error.name){
            case 'Invalid State Error':
                console.log('Invalid State has been reached');
            default: 
                console.log('Error occured with error name:', error.name,error.message);    
        }
    });
}
window.Recorder= {
    startRecording,
    stopRecording
};
  