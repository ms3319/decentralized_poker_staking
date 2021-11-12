import fetch from 'node-fetch';

const GameType = {
  SingleGame: '0',
  Tournament: '1'
};

export default function start(watchedGames, contract, interval) {
  setInterval(() => { checkGamesChanged(watchedGames) }, interval)
}

function checkGamesChanged(watchedGames) {
  console.log("Checking whether game status has changed")
  const watchedSingleGames = watchedGames.filter(game => game.gameType === GameType.SingleGame)
  console.log(`watchedSingleGames: ${watchedSingleGames}`)
  const watchedTournaments = watchedGames.filter(game => game.gameType === GameType.Tournament)
  console.log(`watchedTournaments: ${watchedTournaments}`)
  if (watchedSingleGames.length > 0) {
    fetch(`http://127.0.0.1:8000/games?id=${watchedSingleGames.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedGames) })
  }
  if (watchedTournaments.length > 0) {
    fetch(`http://127.0.0.1:8000/tournaments?id=${watchedTournaments.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedGames) })
  }
}

// Should we check at some point that all of the watchedGames are in the api response?
function compareAndUpdate(data, watchedGames) {
  console.log(`Got response from the server:`)
  console.log(data)
  for (let game in data) {
    if (data[game].completed) {
      console.log("Found a game that completed!!")
      console.log(data[game])
      watchedGames.splice(watchedGames.findIndex(stake => stake.apiId === game), 1);
      // Issue smart contract call to update the stake status
    }
  }
}

// module.exports = { start }