import pymongo

def connectionBD():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["chat_doubleP"] 

        collection = db["mensajes"]
        
        return collection
    except Exception as e:
        print(f"Error de conexión con MongoDB: {e}")
        return None
