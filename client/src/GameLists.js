import React, {useEffect} from "react";
import {dateFromTimeStamp, GameType, parseOptions} from "./utils";
import HorizontalTile from "./HorizontalTile";
import tileStyles from "./HorizontalTile.module.css";
import buttonStyles from './Button.module.css'
import Button from "./Button";

import MultiStakeSummary from "./MultiStakeSummary";

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

class SelectButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isSelected: false};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = e => {
    this.props.onClick();
    e.stopPropagation();  // Prevents HorizontalTile's showDetails() function from firing.
    this.setState(prevState => ({
      isSelected: !prevState.isSelected
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick} className={this.state.isSelected ? tileStyles.selectedButton : tileStyles.selectButton}>
        {this.state.isSelected ? 'Selected' : 'Select'}
      </button>
    );
  }
}

export const GameList = ({ showDetails, activeRequests, contract, options, canInvest, playerName, tokenContract, backerAccount, reloadContractState }) => {
  const [namedRequests, setNamedRequests] = React.useState([])
  const [stakesSelected, setStakesSelected] = React.useState(new Map())
  const [numberOfStakesSelected, setNumberOfStakesSelected] = React.useState(0);
  const [showMultiStakeSummary, setShowMultiStakeSummary] = React.useState(false);

  const openMultiStakeSummary = () => {
    setShowMultiStakeSummary(true)
  }

  const closeMultiStakeSummary = () => {
    setShowMultiStakeSummary(false)
  }

  useEffect(() => {
    nameRequests(activeRequests)
      .then(namedRequests => setNamedRequests(namedRequests));
  }, [contract, activeRequests, numberOfStakesSelected])

  const considerStake = (name, request) => {
    if (!(stakesSelected.has(request.id))) {
      setStakesSelected(new Map(stakesSelected.set(request.id, [name, request])));
      setNumberOfStakesSelected(numberOfStakesSelected + 1);
    } else {
      setStakesSelected((prev) => {
        const newMap = new Map(prev);
        newMap.delete(request.id);
        return newMap;
      });
      setNumberOfStakesSelected(numberOfStakesSelected - 1);
    }
  }

  return (
    <div>
      {namedRequests.map(namedRequest => {
        const [name, request] = namedRequest
        return (
          <div key={request.id}>
            <HorizontalTile key={request.id} canInvest={canInvest} onClick={() => showDetails([name, request])}>
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
              {canInvest && <SelectButton onClick={() => {considerStake(name, request);}}></SelectButton>}
            </HorizontalTile>
          </div>  
        )
      })}
      
      {canInvest && <MultiStakeSummary requests={[ ...stakesSelected.keys() ].map(id => stakesSelected.get(id))} onHide={closeMultiStakeSummary} 
                      show={showMultiStakeSummary} playerName={playerName} contract={contract} tokenContract={tokenContract} backerAccount={backerAccount}
                      reloadContractState={reloadContractState}/>}

      {canInvest && numberOfStakesSelected > 0 &&
        <center>
          <Button style={{margin: "10px 0px 0px 0px"}} onClick={openMultiStakeSummary}>
              Invest
          </Button>
        </center> 
      }

      {canInvest && numberOfStakesSelected <= 0 &&
        <center>
          <button className={buttonStyles.disabledSafestakeButton} style={{margin: "10px 0px 0px 0px"}}>
            Invest
          </button>
        </center>  
      }
      
    </div>
  )
}