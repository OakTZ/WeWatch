#from math import comb
import websockets
import ssl
import pathlib
import asyncio
import string
import random
import time
from random_username.generate import generate_username





#SETTING UP VARIABLES AND FUNCTIONS#

global ids
ids={"ID":"x"} #ID=8TTTF  #to delete do del ids["ID"]

global usernames
usernames={"ID":"uname"}

global rooms
rooms={"ID":(["password","url","current_time"],["x","y","z"])} #ID=6FFTF , "password=4TTTF"

global room_members
room_members={"ID":["u1","u2","u3"]}

global used_combs
used_combs=[]

def create_new_id(client): 
    global ids
    new_id=generate_comb(8,True,True,True,False)
    ids[new_id]=client
    return new_id

def create_new_username(id):
    global usernames
    new_uname=generate_username()[0]

    while True:
        if new_uname not in usernames.values():
            usernames[id]=new_uname
            return new_uname

                
def create_new_room(soc_id,url):
    global rooms
    new_id=generate_comb(6,False,False,True,False)
    password=generate_comb(4,True,True,True,False)
    rooms[new_id]=([password,url,"current_time"],[soc_id])
    room_members[new_id]=[usernames[soc_id]]
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
    delay=500
    return (int(round(time.time() * 1000)+delay)) #rounding to ms

async def broadcast(msg):
    global rooms

    if "new_u" in msg:

        data=msg.split(',') #w.r,new_u,room_id,u1,u2,u3,u4,u5
        for uId in (rooms[data[2]][1]):
            try:
                print("sending new u")
                await ids[uId].send(msg) 
            except Exception as e :
                print("exe:")
                print(e)

    elif "left_u" in msg:

        data=msg.split(',') #w.r,left_u,room_id,u1
        for uId in (rooms[data[2]][1]):
            try:
                await ids[uId].send(msg) 
            except Exception as e :
                print("exe:")
                print(e)
    
    else:
        data=msg.split(',') #0-w.r,1-room id,2-user id,3-command,4-vid tl
        rooms[data[1]][0][2]=data[4]#setting current time in watching room
        #print(f"set current time in room: {data[1]} to : {rooms[data[1]][0][2]}")
        utc=cmd_utc()

        for uId in (rooms[data[1]][1]):
            try:
                await ids[uId].send((str(data[0])+","+str(data[3])+","+str(data[4])+","+str(utc))) #0-w.r,1-command,2-vid tl,3-UTC
            except Exception as e :
                print("exe:")
                print(e)





#MAIN CODE#


async def listen(websocket,path):
    global rooms
    global ids
    global used_combs

    try:
        async for message in websocket:

            if ("w.r" in message):

                if("k.a" in message): #keep connection alive
                    data=message.split(",") #w.r,k.a,uId,rId
                    re=data[2] in rooms[data[3]][1]
                    await websocket.send(str(re))

                else:
                    await broadcast(message) #maybe needs await
                
                

            else:

                if (message=="get_id"):

                    soc_id=(create_new_id(websocket))
                    u_name=create_new_username(soc_id)
                    print(F"NEW USER: {soc_id} - {u_name}")
                    await websocket.send(soc_id+","+u_name)

                elif("reconnecting" in message):

                    data=message.split(',')
                    check_id=data[1]
                    username=data[2]
                    #print(f"{data[1]} wants to recconect")
                    if check_id in ids:
                        #print("OK")
                        ids[check_id]=websocket
                        usernames[check_id]=username
                        #print(f"reconnecting {data[1]} by id")
                        await websocket.send("reconnected you by id")

                    else:
                        new_id=(create_new_id(websocket))
                        ids[new_id]=websocket
                        usernames[new_id]=username
                        #print(f"gave {data[1]} new id -> {new_id}")
                        await websocket.send("new_id,"+new_id)

                        #await websocket.send(soc_id)

                if ("create_room," in message):

                    data=message.split(',')
                    url=data[1]
                    soc_id=data[-1]
                    #print(f"creating new room -> {message}")
                    room_id=create_new_room(soc_id,url)
                    print(f"room: {room_id} was created by: {soc_id}")
                    await websocket.send(room_id+","+rooms[room_id][0][0]+","+rooms[room_id][0][1]) #id,password
                
                if ("join_room," in message):
                    data=message.split(',')
                    room_id=data[1]
                    room_password=data[2]
                    soc_id=data[-1]
                    try:
                        if (rooms[room_id][0][0]==room_password):
                            
                            print(f"{soc_id} has joined room {room_id}")
                            room_members[room_id].append(usernames[soc_id])

                            str_members=','.join(room_members[room_id])
                            await broadcast(f"w.r,new_u,{room_id},{str_members}")

                            rooms[room_id][1].append(soc_id)

                            print(rooms)

                            await websocket.send(f"TRUE,{rooms[room_id][0][1]},{str_members}") #TRUE,url,u1,u2,u3...

                            utc=cmd_utc()
                            await websocket.send("w.r,move tl,"+rooms[room_id][0][2]+","+utc) #0-w.r,1-command,2-vid tl,3-UTC
                        else:
                            await websocket.send("FALSE")
                    except:
                        await websocket.send("FALSE")

                if ("exit_room" in message):

                    data=message.split(',')
                    room_id=data[1]
                    soc_id=data[-1]

                    print(f"user: {soc_id} exited room {room_id}")
                        

                    #checks if room user leaving is the last one
                    if (rooms[room_id][1].__len__()==1): #YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                        # need to delete room id and password from used combs
                        print(f"deleting room: {room_id}")
                        #delete room
                        del rooms[room_id]
                    else:
                        print(f"IN ELSE")
                        if (rooms[room_id][1].index(soc_id)==0):
                            nxt_host=rooms[room_id][1][1]
                            print(f"Assigning new host: {nxt_host} to room: {room_id}")
                            await ids[nxt_host].send("w.r,host")

                        rooms[room_id][1].remove(soc_id)
                        str_members=','.join(room_members[room_id])
                        room_members[room_id].remove(usernames[soc_id])
                        await broadcast(f"w.r,left_u,{room_id},{str_members}") #w.r,left_u,room_id,u1
                        print(rooms)
                    
                else:
                    pass
                    #print ("Received and echoing message: "+message)
                #await websocket.send(message)

    except websockets.exceptions.ConnectionClosed:
        print("A CLIENT HAS DISSCONECTED")



start_server = websockets.serve(listen, "0.0.0.0", 8765) 

print("WebSockets echo server starting") #FLUSH=TRUE
asyncio.get_event_loop().run_until_complete(start_server)

print("WebSockets echo server running")
asyncio.get_event_loop().run_forever()
