from math import comb
import websockets
import asyncio
import string
import random
import time

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
    
#returns time since Unix Epoch in 1.1.1970 - UTC  
def cmd_utc():
    delay=1000
    return (int(round(time.time() * 1000)+delay)) #rounding to ms

async def broadcast(msg):
    data=msg.split(',') #0-w.r,1-room id,2-user id,3-command,4-vid tl
    utc=cmd_utc()
    try:
        for uId in (rooms[data[1]][1]):
            await ids[uId].send((str(data[0])+","+str(data[3])+","+str(data[4])+","+str(utc))) #0-w.r,1-command,2-vid tl,3-UTC
    except Exception as e :
        print(e)




#MAIN CODE#

async def listen(websocket,path):
    global rooms

    async for message in websocket:

        if ("w.r" in message):
            await broadcast(message) #maybe needs await
            
            

        else:

            if (message=="get_id"):

                print("NEW USER HAS JOINED")
                soc_id=(create_new_id(websocket))
                await websocket.send(soc_id)

            if ("create_room," in message):

                data=message.split(',')
                url=data[1]
                soc_id=data[-1]
                room_id=create_new_room(soc_id,url)
                print(rooms)
                await websocket.send(room_id+","+rooms[room_id][0][0]+","+rooms[room_id][0][1]) #id,password
            
            if ("join_room," in message):
                data=message.split(',')
                room_id=data[1]
                room_password=data[2]
                soc_id=data[-1]
                try:
                    if (rooms[room_id][0][0]==room_password):
                        rooms[room_id][1].append(soc_id)
                        print(rooms)
                        await websocket.send(f"TRUE,{rooms[room_id][0][1]}")
                    else:
                        await websocket.send("FALSE")
                except:
                    await websocket.send("FALSE")

            if ("exit_room" in message):

                data=message.split(',')
                room_id=data[1]
                soc_id=data[-1]

                rooms[room_id][1].remove(soc_id)

                #checks if room is empty
                if not (rooms[room_id][1]):
                    #delete room
                    del rooms[room_id]
                print(rooms)
                
            else:
                pass
                #print ("Received and echoing message: "+message)
            #await websocket.send(message)

start_server = websockets.serve(listen, "0.0.0.0", 8765)

print("WebSockets echo server starting") #FLUSH=TRUE
asyncio.get_event_loop().run_until_complete(start_server)

print("WebSockets echo server running")
asyncio.get_event_loop().run_forever()
