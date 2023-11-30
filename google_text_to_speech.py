from google.cloud import speech_v1p1beta1 as speech
def get_transcription(response):
    best=''
    for result in response.results:
          data= result.alternatives[0].transcript
          if len(data) > len(best):
             best= data
    return best
def transcribe_audio(file_path):
    client = speech.SpeechClient()

    with open(file_path, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,  # Modify based on your audio file
        language_code="en-US",    # Change language if required
    )

    response = client.recognize(config=config, audio=audio)
    print(response)
    return get_transcription(response)

# Replace 'file_path' with your local audio file path
#transcribe_audio('jfk.wav')
