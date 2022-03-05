import websockets
import asyncio

#SETTING UP VARIABLES AND FUNCTIONS#

global ids
ids=[(0,"xxx")]

global rooms
rooms=[[0,"url","x","y","z"]]

def create_new_id(client): 
    global ids
    last=ids[-1][0]  #len(ids)-1
    new_id=last+1
    ids.append((new_id,client))
    return new_id
                
def create_new_room(client,url):
    global rooms
    last=rooms[-1][0]
    new_room_num=last+1
    rooms.append([new_room_num,url,client])
    print(rooms)
            
#MAIN CODE#

async def listen(websocket, path):
    global rooms

    async for message in websocket:

        if (message=="get_id"):

            print("exe needs id")
            new_id=str(create_new_id(websocket))
            print(new_id)
            await websocket.send(new_id)

        if ("create_room," in message):

            url=message.split(',')[-1]
            create_new_room(websocket,url)
            await websocket.send("created a new room numbered: "+ str(rooms[-1][0]))

        else:

            print ("Received and echoing message: "+message)
        #await websocket.send(message)

start_server = websockets.serve(listen, "0.0.0.0", 8765)

print("WebSockets echo server starting") #FLUSH=TRUE
asyncio.get_event_loop().run_until_complete(start_server)

print("WebSockets echo server running")
asyncio.get_event_loop().run_forever()
