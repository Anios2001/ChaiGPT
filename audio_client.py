import websockets;
import asyncio;

SERVER_IP_ADDRESS= "localhost"
SERVER_PORT= 8081

async def getFile():
    try:
        async with websockets.connect(f"ws://{SERVER_IP_ADDRESS}:{SERVER_PORT}") as connection:
            file_name = input('Enter name of file to be requested from the server:\n')
            await connection.send(file_name)
            print(f'{file_name} Requested from the server....')

            response= await connection.recv()
            if response.startswith('FNF'.encode()):
                print(f'File does not exist on server...')
            else:
                with open('recieved.m4a', 'wb') as audio_file:
                    audio_file.write(response)    
    except websockets.ConnectionClosedOK:
        print(websockets.ConnectionClosedOK.reason)
    except PermissionError as e:
        print(f"Permission denied: {e}")
    except IsADirectoryError as e:
        print(f" The file is a directory : {e}")
    except TypeError as e:
        print(f"Invalid data type for writing: {e}")
    except IOError as e:
        print(f"Input/Output error occurred: {e}")

asyncio.run(getFile())              