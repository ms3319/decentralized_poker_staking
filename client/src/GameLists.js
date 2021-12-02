import React, {useEffect} from "react";
import {dateFromTimeStamp, GameType, parseOptions} from "./utils";
import HorizontalTile from "./HorizontalTile";
import tileStyles from "./HorizontalTile.module.css";

const nameRequests = async (games) => {
  return await Promise.all(games.map(async game => {
    const gameOrTournamentFromApi = (parseInt(game.gameType) === GameType.SingleGame) ?
      (await fetch(`https://safe-stake-mock-api.herokuapp.com/games/${game.apiId}`)
        .then(response => response.json())
        .then(game => game.name)
        .catch(() => "Unknown game")) :
      (await fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments/${game.apiId}`)
        .then(response => response.json())
        .then(tournament => tournament.name)
        .catch(() => "Couldn't get tournament name"))
    return [gameOrTournamentFromApi, game]
  }))
}

export const GameList = ({ showDetails, activeRequests, options }) => {
  const [namedRequests, setNamedRequests] = React.useState([])

  useEffect(() => {
    nameRequests(activeRequests)
      .then(namedRequests => setNamedRequests(namedRequests))
  }, [activeRequests])

  return (
    <div>
      {namedRequests.map(namedRequest => {
        const [name, request] = namedRequest
        return (
          <HorizontalTile key={request.id} onClick={() => showDetails([name, request])}>
            <div className={`${tileStyles.left} ${tileStyles.longer}`} style={{fontSize: "0.8em"}}>
              <span className={tileStyles.value}>{name}</span>
              <span className={tileStyles.underValue}>{dateFromTimeStamp(request.stakeTimeStamp.scheduledForTimestamp).toLocaleDateString()}</span>
            </div>
            {parseOptions(options, request).map(option => (
              <div key={[request.id, option.label]}>
                <span style={option.labelStyles ?? {}} className={tileStyles.label}>{option.label}</span>
                <span style={option.valueStyles ?? {}} className={tileStyles.value}>{option.value}</span>
              </div>
            ))}
          </HorizontalTile>
        )
      })}
    </div>
  )
}