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

# /games
# Get a list of all games occured/to come
class Games:
    def on_get(self, req, resp):
        data = db.child("games").get().val()
        resp.text = json.dumps(data)

# /games/{id}
# Get an individual game occurred/to come
class Game:
    def on_get(self, req, resp, game_id):
        data = db.child("games").child(game_id).get().val()
        resp.text = json.dumps(data)

# /tournaments
# TODO: Shall we just return the ids here using shallow?
# Get a list of all tournaments occurred/to come
class Tournaments:
    def on_get(self, req, resp):
        data = db.child("tournaments").get().val()
        resp.text = json.dumps(data)

# /tournament/{id}
# GET: Get an individual tournament occurred/to come with given id
# POST: Create a new tournament, returns id
class Tournament:
    def on_get(self, req, resp, tournament_id):
        data = db.child("tournaments").child(tournament_id).get().val()
        resp.text = json.dumps(data)
    
    def on_post(self, req, resp, buyIn, players=[]):
        data = {"buyIn": buyIn, "players": players} 
        resp_data = db.child("tournaments").push(data)
        print(resp_data)

# /tournament/{id}/players
# Get the list of players involved in a certain tournament
class TournamentPlayers:
    def on_get(self, req, resp, tournament_id):
        data = db.child("tournaments").child(tournament_id).child("players").get().val()
        resp.text = json.dumps(data)

# /tournament/{id}/tournament_take_home/{id}
# See the amount of money taken home by each of the players in the game
# profit = buyIn - takeHomeMoney
class TournamentTakeHome:
    def on_get(self, req, resp, tournament_id, player_id):
        data = db.child("tournaments").child(tournament_id).child("takeHomeMoney").child(player_id).get().val()
        resp.text = json.dumps(data)

# /tournament/{id}/tournament_status
# GET : retrieve the status of tournament to check if it is completed or not
# PUT : update the status of the tournament
class TournamentStatus:
    def on_get(self, req, resp, tournament_id):
        data = db.child("tournaments").child(tournament_id).child("status").get().val()
        resp.text = json.dumps(data)
    
    def on_put(self, req, resp, tournament_id, status):
        db.child("tournaments").child(tournament_id).child("status").update(status);

api = falcon.App()
players_endpoint = Players()
player_endpoint = Player()
api.add_route('/players', players_endpoint)
api.add_route('/players/{player_id}', player_endpoint)

games_endpoint = Games()
game_endpoint = Game()
api.add_route('/games', games_endpoint)
api.add_route('/game/{id}', game_endpoint)

tournaments_endpoint = Tournaments()
tournament_endpoint = Tournament()
tournament_party_endpoint = TournamentPlayers()
tournament_take_home_endpoint = TournamentTakeHome()
tournament_status_endpoint = TournamentStatus()
api.add_route('/tournaments', tournaments_endpoint)
api.add_route('/tournaments/{tournament_id}', tournament_endpoint)
api.add_route('/tournaments/{tournament_id}/players', tournament_party_endpoint)
api.add_route('/tournaments/{tournament_id}/tournament_take_home/{player_id}', tournament_take_home_endpoint)
api.add_route('/tournaments/{tournament_id}/tournament_status', tournament_status_endpoint)