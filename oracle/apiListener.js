import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { StakeStatus } from "./stakeListener.js";
dotenv.config()

const GameType = {
  SingleGame: '0',
  Tournament: '1'
};

const convertToTokenAmount = amount => amount * 1e18

const apiUrl = process.env.API_URL

export default function start(watchedStakes, contract, interval, sendGamePlayedTransaction, sendRequestExpiredTransaction) {
  console.log(`Starting api listener with interval duration ${interval}ms`)
  setInterval(() => { checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction, sendRequestExpiredTransaction) }, interval)
}

function checkGamesChanged(watchedStakes, contract, sendGamePlayedTransaction, sendRequestExpiredTransaction) {
  console.log(`Making api calls to check status of ${watchedStakes.length} games`)
  const watchedSingleGames = watchedStakes.filter(game => game.gameType === GameType.SingleGame)
  const watchedTournaments = watchedStakes.filter(game => game.gameType === GameType.Tournament)
  if (watchedSingleGames.length > 0) {
    fetch(`${apiUrl}/games?id=${watchedSingleGames.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction, sendRequestExpiredTransaction) })
  }
  if (watchedTournaments.length > 0) {
    fetch(`${apiUrl}/tournaments?id=${watchedTournaments.map(game => game.apiId).join('&id=')}`)
      .then(response => response.json())
      .then(data => { compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction, sendRequestExpiredTransaction) })
  }
}

// Should we check at some point that all of the watchedGames are in the api response?
function compareAndUpdate(data, watchedStakes, contract, sendGamePlayedTransaction, sendRequestExpiredTransaction) {
  // Remove from the watched stakes
  const removeWatchedStake = id => watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === id), 1);

  for (let game in data) {
    if (data[game].completed) {
      // In case there is more than one stake for this game/tournament
      const matchingStakes = watchedStakes.filter(stake => stake.apiId === game)
      console.log("Game update detected, affecting the following stakes:")
      console.log(matchingStakes)
      for (const matchingStake of matchingStakes) {
        if (matchingStake.trying) { continue }
        switch (matchingStake.status) {
          case StakeStatus.Filled:
            console.log("Stake status was 'Filled' - will send GamePlayed transaction")
            contract.methods.getPlayer(matchingStake.horse).call()
              .then(player => player.apiId in data[game].takeHomeMoney ? data[game].takeHomeMoney[player.apiId] : 0)
              .then(amountWon => {
                removeWatchedStake(matchingStake.id);
                sendGamePlayedTransaction(matchingStake.id, convertToTokenAmount(amountWon).toLocaleString('fullwide', {useGrouping:false}))
                  .catch(() => watchedStakes.push(matchingStake));
              })
              .catch(err => console.error(err))
            break;
          case StakeStatus.PartiallyFilled:
            console.log("Stake status was 'PartiallyFilled'")
            // Check if the investment was past the threshold.
            if (parseInt(matchingStake.investmentDetails.filledAmount) > parseInt(matchingStake.investmentDetails.playThreshold)) {
              console.log("The filledAmount was passed the threshold - sending game played transaction")
              // If yes, sendGamePlayedTransaction to send back update the game state and set backerReturns,
              contract.methods.getPlayer(matchingStake.horse).call()
                .then(player => player.apiId in data[game].takeHomeMoney ? data[game].takeHomeMoney[player.apiId] : 0)
                .then(amountWon => {
                  removeWatchedStake(matchingStake.id);
                  sendGamePlayedTransaction(matchingStake.id, convertToTokenAmount(amountWon).toLocaleString('fullwide', {useGrouping:false}))
                    .catch(() => watchedStakes.push(matchingStake));
                })
                .catch(err => console.error(err))
            } else {
              // If not, expire the stake to send the money back to the investors.
              console.log("The filled amount was below the threshold - will send RequestExpired transaction")
              sendRequestExpiredTransaction(matchingStake.id)
                .then(() => removeWatchedStake(matchingStake.id))
                .catch(err => console.error(err))
            }
            break;
          case StakeStatus.Requested:
            // Expire the stake
            console.log("Stake status was 'Requested' - will send RequestExpired transaction")
            sendRequestExpiredTransaction(matchingStake.id)
              .then(() => removeWatchedStake(matchingStake.id))
              .catch(err => console.err(err))
        }
      }
    }
  }
}

