#server 
import websockets;
import asyncio;
import time;
import math;
import os;
import json;
import uuid; 

from google_text_to_speech import transcribe_audio;
#from textGeneration import getGeneration;
SERVER_IP_ADDRESS= "localhost"
SERVER_PORT= 8081
AUDIO_FILE_NAME= "user-audio-"
AUDIO_FILE_EXTENSION=".wav"
user_cached_ids= [];
def getFile(file_name):
    try:
        with open(file_name,'rb') as file:
            bytedata= file.read()
        return bytedata
    except PermissionError as e:
        print(f"Permission denied: {e}")
    except IsADirectoryError as e:
        print(f"Attempted to open a directory: {e}")
    except IOError as e:
        print(f"Input/Output error occurred: {e}")
def saveFile(audioStream):
    FILE_NAME= f'{AUDIO_FILE_NAME}{uuid.uuid4()}{AUDIO_FILE_EXTENSION}'
    with open(f'./USER_AUDIOS/{FILE_NAME}','wb') as file_handle:
        file_handle.write(audioStream)
    return FILE_NAME   

async def handler(websocket):
    while True:
        try:
            start_time= time.time(); 
            
            audioData = await websocket.recv()
            audioFileName= saveFile(audioData)
            transcription = transcribe_audio(f'./USER_AUDIOS/{audioFileName}')
            # please run only on a virtual machine this downloads 935 mb of data to the store and caches it
            #generatedResponse = getGeneration(transcription)
 
            elapsed_time= time.time() - start_time; 
            print(f'Transcription completed, file saved as {audioFileName}, operation took {math.trunc(elapsed_time)} sec(s)')
            print(f'Generated answer is {transcription}')
            await websocket.send(transcription) 
        except (websockets.ConnectionClosedOK, websockets.ConnectionClosed, websockets.ConnectionClosedError):
            break
       
    

async def main():
    async with websockets.serve(handler,SERVER_IP_ADDRESS,SERVER_PORT):
        print (f'Audio Server is listening on {SERVER_IP_ADDRESS}:{SERVER_PORT}')
        await asyncio.Future() #run forever

if __name__=="__main__":
    asyncio.run(main())