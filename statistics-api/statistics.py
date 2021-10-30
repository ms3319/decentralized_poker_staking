import falcon, json
import pyrebase
import os
from dotenv import load_dotenv

load_dotenv()
pyrebase_config = {
    "apiKey": os.getenv('FIREBASE_API_KEY'),
    "databaseURL": os.getenv('FIREBASE_DATABASE_URL'),
    "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN'),
    "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET')
}

firebase = pyrebase.initialize_app(pyrebase_config)
db = firebase.database()

# /players
# Get a list of all players
class Players:
    def on_get(self, req, resp):
        data = db.child("players").get().val()
        resp.text = json.dumps(data)

# /players/{id}
# Get an individual player
class Player:
    def on_get(self, req, resp, player_id):
        data = db.child("players").child(player_id).get().val()
        resp.text = json.dumps(data)

api = falcon.App()
players_endpoint = Players()
player_endpoint = Player()
api.add_route('/players', players_endpoint)
api.add_route('/players/{player_id}', player_endpoint)
