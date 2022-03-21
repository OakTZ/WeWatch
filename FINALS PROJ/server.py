from math import comb
import websockets
import asyncio
import string
import random

#SETTING UP VARIABLES AND FUNCTIONS#

global ids
ids={"ID":"x"} #ID=8TTTF  #to delete do del ids["ID"]

global rooms
rooms={"ID":(["password","url"],["x","y","z"])} #ID=6FFTF , "password=4TTTF"

global used_combs
used_combs=[]

def create_new_id(client): 
    global ids
    new_id=generate_comb(8,True,True,True,False)
    ids[new_id]=client
    return new_id
                
def create_new_room(soc_id,url):
    global rooms
    new_id=generate_comb(6,False,False,True,False)
    password=generate_comb(4,True,True,True,False)
    rooms[new_id]=([password,url],[soc_id])
    print(rooms)
    return new_id

def generate_comb(length,lowercase,uppercase,digits,symbols):
    global used_combs
    lst=""
    #list of all lowercase, uppercase, digits and symbols
    if lowercase:
        lst+=string.ascii_lowercase
    if uppercase:
        lst+=string.ascii_uppercase
    if digits:
        lst+=string.digits
    if symbols:
        lst+=string.punctuation
    while True:
        temp=random.sample(lst,length)
        comb="".join(temp)
        if comb not in used_combs:
            used_combs.append(comb)
            return comb
    


#MAIN CODE#

async def listen(websocket,path):
    global rooms

    async for message in websocket:

        if (message=="get_id"):

            print("exe needs id")
            soc_id=(create_new_id(websocket))
            print(soc_id)
            await websocket.send(soc_id)

        if ("create_room," in message):

            data=message.split(',')
            url=data[1]
            soc_id=data[-1]
            room_id=create_new_room(soc_id,url)
            await websocket.send(room_id+","+rooms[room_id][0][0]+","+rooms[room_id][0][1]) #id,password
        
        if ("join_room," in message):
            data=message.split(',')
            room_id=data[1]
            room_password=data[2]
            try:
                if (rooms[room_id][0][0]==room_password):
                    await websocket.send(f"TRUE,{rooms[room_id][0][1]}")
                else:
                    await websocket.send("FALSE")
            except:
                await websocket.send("FALSE")


        else:
            pass
            #print ("Received and echoing message: "+message)
        #await websocket.send(message)

start_server = websockets.serve(listen, "0.0.0.0", 8765)

print("WebSockets echo server starting") #FLUSH=TRUE
asyncio.get_event_loop().run_until_complete(start_server)

print("WebSockets echo server running")
asyncio.get_event_loop().run_forever()
