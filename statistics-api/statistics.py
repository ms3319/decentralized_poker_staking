import falcon, json
import pyrebase
import os
import datetime
from dotenv import load_dotenv

load_dotenv()
pyrebase_config = {
    "apiKey": os.getenv('FIREBASE_API_KEY'),
    "databaseURL": os.getenv('FIREBASE_DATABASE_URL'),
    "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN'),
    "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET')
}

def noquote(s):
    return s
pyrebase.pyrebase.quote = noquote
firebase = pyrebase.initialize_app(pyrebase_config)
db = firebase.database()

# /players
# GET: Get a list of all players
# POST: Create a new player and returns their id
class Players:
    def on_get(self, req, resp):
        data = db.child("players").get().val()
        resp.text = json.dumps(data)

    def on_post(self, req, resp):
        name = req.get_param("name", required=True)
        data = {"name": name, "gamesPlayed": 0, "gamesWon": 0, "tournamentsWon": 0, "totalWinnings": 0.0, "tournamentsPlayed": 0, "totalProfits": 0.0,} 
        resp_data = db.child("players").push(data)
        resp.text = json.dumps(resp_data)

# /players/{id}
# GET: Get an individual player
# PUT: Update a player
class Player:
    def on_get(self, req, resp, player_id):
        data = db.child("players").child(player_id).get().val()
        if not data:
            resp.text = json.dumps({})
        else:
            resp.text = json.dumps(data)

# /games
# GET: retrieve a list of all games occured/to come
# POST: insert a new game in the list of games and return the id
class Games:
    def on_get(self, req, resp):
        filter = req.get_param_as_list("id")
        completed_value = req.get_param_as_bool("completed")
        data = db.child("games").get().val()
        if (data == None):
            resp.text = json.dumps({})
            return
        if (filter != None):
            data = { id: data[id] for id in set(filter) & set(data.keys()) }
        if (completed_value != None):
            data = {k: v for k, v in data.items() if v["completed"] == completed_value}
        resp.text = json.dumps(data)

    def on_post(self, req, resp):
        buyIn = float(req.get_param("buyIn", required=True))
        name = req.get_param("name", required=True)
        scheduledFor = (datetime.datetime.strptime(req.get_param("scheduledFor", required=True), '%Y-%m-%d %H:%M:%S') - datetime.datetime(1970, 1, 1)).total_seconds()
        players = json.loads(req.get_param("players"))
        data = {"buyIn": buyIn, "players": players, "completed": False, "name": name, "scheduledFor": scheduledFor}
        resp_data = db.child("games").push(data)
        resp.text = json.dumps(resp_data)

# /games/{id}
# Get an individual game occurred/to come
class Game:
    def on_get(self, req, resp, game_id):
        data = db.child("games").child(game_id).get().val()
        if not data:
            resp.text = json.dumps({})
        else:
            resp.text = json.dumps(data)

    def on_put(self, req, resp, game_id):
        takeHomeMoney = json.loads(req.get_param("takeHomeMoney"))

        max_key = None
        max_val = -1000000000
        # Update each players total winnings and tournaments played
        for (key, val) in takeHomeMoney.items():
            if max_val < val:
                max_val = val
                max_key = key

            playerGamesPlayed = db.child("players").child(key).child("gamesPlayed").get().val()

            playerTotalWinnings = db.child("players").child(key).child("totalWinnings").get().val()
            newTotalWinnings = playerTotalWinnings + val

            db.child("players").child(key).update({"gamesPlayed": playerGamesPlayed + 1, "totalWinnings": newTotalWinnings})

        playerGamesWon = db.child("players").child(max_key).child("gamesWon").get().val()
        db.child("players").child(max_key).update({"gamesWon": playerGamesWon + 1})
        completed = bool(req.get_param("completed"))
        data = {"takeHomeMoney": takeHomeMoney, "completed": completed}
        resp_data = db.child("games").child(game_id).update(data)
        print(resp_data)
        resp.text = json.dumps(resp_data)

# /tournaments
# TODO: Shall we just return the ids here using shallow?
# GET: Get a list of all tournaments occurred/to come
# POST: Create a new tournament and return its id
class Tournaments:
    def on_get(self, req, resp):
        filter = req.get_param_as_list("id")
        completed_value = req.get_param_as_bool("completed")
        data = db.child("tournaments").get().val()
        if (data == None):
            resp.text = json.dumps({})
            return
        if (filter != None):
            data = { id: data[id] for id in set(filter) & set(data.keys()) }
        if (completed_value != None):
            data = {k: v for k, v in data.items() if v["completed"] == completed_value}
        resp.text = json.dumps(data)

    def on_post(self, req, resp):
        buyIn = float(req.get_param("buyIn", required=True))
        name = req.get_param("name", required=True)
        scheduledFor = (datetime.datetime.strptime(req.get_param("scheduledFor", required=True), '%Y-%m-%d %H:%M:%S') - datetime.datetime(1970, 1, 1)).total_seconds()
        players = json.loads(req.get_param("players"))
        data = {"buyIn": buyIn, "players": players, "completed": False, "name": name, "scheduledFor": scheduledFor}
        resp_data = db.child("tournaments").push(data)
        resp.text = json.dumps(resp_data)

# /tournaments/{id}
# GET: Get an individual tournament occurred/to come with given id
# PUT: Update tournament's details, return full tournament object
class Tournament:
    def on_get(self, req, resp, tournament_id):
        data = db.child("tournaments").child(tournament_id).get().val()
        if not data:
            resp.text = json.dumps({})
        else:
            resp.text = json.dumps(data)
    
    def on_put(self, req, resp, tournament_id):
        takeHomeMoney = json.loads(req.get_param("takeHomeMoney"))

        max_key = None
        max_val = -1000000
        # Update each players total winnings and tournaments played
        for (key, val) in takeHomeMoney.items():
            if max_val < val:
                max_val = val
                max_key = key
            
            playerTournamentsPlayed = db.child("players").child(key).child("tournamentsPlayed").get().val()

            playerTotalWinnings = db.child("players").child(key).child("totalWinnings").get().val()
            newTotalWinnings = playerTotalWinnings + val

            db.child("players").child(key).update({"tournamentsPlayed": playerTournamentsPlayed + 1, "totalWinnings": newTotalWinnings})

        playerTournamentsWon = db.child("players").child(max_key).child("tournamentsWon").get().val()
        db.child("players").child(max_key).update({"tournamentsWon": playerTournamentsWon + 1})
        completed = bool(req.get_param("completed"))
        data = {"takeHomeMoney": takeHomeMoney, "completed": completed}
        resp_data = db.child("tournaments").child(tournament_id).update(data)
        print(resp_data)
        resp.text = json.dumps(resp_data)

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
        data = db.child("tournaments").child(tournament_id).child("completed").get().val()
        resp.text = json.dumps(data)
    
    def on_put(self, req, resp, tournament_id):
        completed = bool(req.get_param("completed"))
        data = db.child("tournaments").child(tournament_id).child("completed").update(completed);
        resp.text = json.dumps(data)

api = falcon.App(cors_enable=True)
api.req_options.auto_parse_form_urlencoded = True

players_endpoint = Players()
player_endpoint = Player()
api.add_route('/players', players_endpoint)
api.add_route('/players/{player_id}', player_endpoint)

games_endpoint = Games()
game_endpoint = Game()
api.add_route('/games', games_endpoint)
api.add_route('/games/{game_id}', game_endpoint)

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