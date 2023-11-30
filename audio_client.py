import websockets;
import asyncio;

SERVER_IP_ADDRESS= "localhost"
SERVER_PORT= 8081

async def getFile():
    try:
        async with websockets.connect(f"ws://{SERVER_IP_ADDRESS}:{SERVER_PORT}") as connection:
            file_name = input('Enter name of file to be send to the server:\n')
            with open(file_name,'rb') as fileBytes:
               await connection.send(fileBytes) 
            transcription = await connection.recv()
            print(transcription)      
    except websockets.ConnectionClosedOK:
        print(websockets.ConnectionClosedOK.reason)
    except FileNotFoundError as e:
        print(f"File not found ")    
    except PermissionError as e:
        print(f"Permission denied: {e}")
    except IsADirectoryError as e:
        print(f" The file is a directory : {e}")
    except TypeError as e:
        print(f"Invalid data type for reading: {e}")
    except IOError as e:
        print(f"Input/Output error occurred: {e}")

asyncio.run(getFile())              