#server 
import websockets;
import asyncio;
import time;
import math;
import os;
import json;
import uuid; 
SERVER_IP_ADDRESS= "localhost"
SERVER_PORT= 8081
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


async def handler(websocket):
    while True:
        try:
            message = await websocket.recv()
            start_time= time.time();  
            print('Serving started...')
            # operation start here
            file= getFile(message)
            print(f'CWD {os.getcwd()}')
            if os.path.exists(f'{os.getcwd()}\{message}'):
                
                await websocket.send(file)
            else:
                print(f'{file} does not exist or path is wrong')
                await websocket.send(f'FNF : {file}')
            # operation ends here
            elapsed_time= time.time() - start_time; 
            print(f'Serving completed, operation took {math.trunc(elapsed_time)} sec(s)')

        except (websockets.ConnectionClosedOK, websockets.ConnectionClosed, websockets.ConnectionClosedError):
            break
       
    

async def main():
    async with websockets.serve(handler,SERVER_IP_ADDRESS,SERVER_PORT):
        print (f'Audio Server is listening on {SERVER_IP_ADDRESS}:{SERVER_PORT}')
        await asyncio.Future() #run forever

if __name__=="__main__":
    asyncio.run(main())