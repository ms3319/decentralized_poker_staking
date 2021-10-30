# Mock Poker Statistics API

## Setup
```
> pip install -r requirements.txt
```

Make sure you have the `.env` file with the correct values from Discord and have created it and put it in this directory.

## Running the server
```
> gunicorn --reload statistics:api
```

## Examples
Making a request to get all players:
```
> curl 'http://127.0.0.1:8000/players'

Response:
[{"gamesPlayed": 237, "name": "Casey Williams"}, {"gamesPlayed": 485, "name": "Alexandru Moraru"}]
```

Making a request to get a single player:
```
> curl 'http://127.0.0.1:8000/players/0'

Response:
{"gamesPlayed": 237, "name": "Casey Williams"}
```
