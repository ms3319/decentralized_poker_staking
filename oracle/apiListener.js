import fetch from 'node-fetch';

const GameType = {
  SingleGame: '0',
  Tournament: '1'
};

const account = '0xF6aE2Fc452d2E0414231243E9E09b7c9493E5362'

export default function start(watchedStakes, contract, interval) {
  setInterval(() => { checkGamesChanged(watchedStakes, contract) }, interval)
}

function checkGamesChanged(watchedStakes, contract) {
  const watchedSingleGames = watchedStakes.filter(game => game.gameType === GameType.SingleGame)
  const watchedTournaments = watchedStakes.filter(game => game.gameType === GameType.Tournament)
  if (watchedSingleGames.length > 0) {
    fetch(`http://127.0.0.1:8000/games?id=${watchedSingleGames.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract) })
  }
  if (watchedTournaments.length > 0) {
    fetch(`http://127.0.0.1:8000/tournaments?id=${watchedTournaments.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract) })
  }
}

// Should we check at some point that all of the watchedGames are in the api response?
function compareAndUpdate(data, watchedStakes, contract) {
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
            //TODO: This transaction should be signed - otherwise it won't work in production
            contract.methods.gamePlayed(matchingStake.id, amountWon).send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })
          })
        // Remove from the watched stakes
        watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === matchingStake.id), 1);
      }
    }
  }
}