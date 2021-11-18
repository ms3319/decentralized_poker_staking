import fetch from 'node-fetch';

const GameType = {
  SingleGame: '0',
  Tournament: '1'
};

export default function start(watchedStakes, contract, interval, sendGamePlayedTransaction) {
  setInterval(() => { checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction) }, interval)
}

function checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction) {
  const watchedSingleGames = watchedStakes.filter(game => game.gameType === GameType.SingleGame)
  const watchedTournaments = watchedStakes.filter(game => game.gameType === GameType.Tournament)
  if (watchedSingleGames.length > 0) {
    fetch(`http://127.0.0.1:8000/games?id=${watchedSingleGames.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction) })
  }
  if (watchedTournaments.length > 0) {
    fetch(`http://127.0.0.1:8000/tournaments?id=${watchedTournaments.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction) })
  }
}

// Should we check at some point that all of the watchedGames are in the api response?
function compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction) {
  for (let game in data) {
    if (data[game].completed) {
      // In case there is more than one stake for this game/tournament
      const matchingStakes = watchedStakes.filter(stake => stake.apiId === game)
      console.log("Game update detected, affecting the following stakes:")
      console.log(matchingStakes)
      for (const matchingStake of matchingStakes) {
        contract.methods.getPlayer(matchingStake.horse).call()
          .then(player => {
            const amountWon = player.apiId in data[game].takeHomeMoney ? data[game].takeHomeMoney[player.apiId] : 0
            sendGamePlayedTransaction(matchingStake.id, amountWon)
          })
        // Remove from the watched stakes
        watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === matchingStake.id), 1);
      }
    }
  }
}

