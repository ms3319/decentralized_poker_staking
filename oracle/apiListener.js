import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config()

const GameType = {
  SingleGame: '0',
  Tournament: '1'
};

const convertToTokenAmount = amount => amount * 1e18

const apiUrl = process.env.API_URL

export default function start(watchedStakes, contract, interval, sendGamePlayedTransaction) {
  console.log(`Starting api listener with interval duration ${interval}ms`)
  setInterval(() => { checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction) }, interval)
}

function checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction) {
  console.log(`Making api calls to check status of ${watchedStakes.length} games`)
  const watchedSingleGames = watchedStakes.filter(game => game.gameType === GameType.SingleGame)
  const watchedTournaments = watchedStakes.filter(game => game.gameType === GameType.Tournament)
  if (watchedSingleGames.length > 0) {
    fetch(`${apiUrl}/games?id=${watchedSingleGames.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction) })
  }
  if (watchedTournaments.length > 0) {
    fetch(`${apiUrl}/tournaments?id=${watchedTournaments.map(game => game.apiId).join('&id=')}`)
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
            sendGamePlayedTransaction(matchingStake.id, convertToTokenAmount(amountWon).toString())
          })
        // Remove from the watched stakes
        watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === matchingStake.id), 1);
      }
    }
  }
}

