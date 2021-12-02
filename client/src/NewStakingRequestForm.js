import React, { useEffect, useState } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"
import { Col } from "react-bootstrap";
import Autosuggest from "react-autosuggest";
import "bootstrap/dist/css/bootstrap.min.css";
import { GameType } from "./utils"

import "./Autosuggest.css"

const renderSuggestion = suggestion => (
  <span>
    {suggestion[1].name + " "}
    <span className="suggestion-id">
      {suggestion[0]}
    </span>
  </span>
)

const NewStakingRequestForm = (props) => {
  const [futureTournaments, setFutureTournaments] = useState({});
  const [futureGames, setFutureGames] = useState({});
  const [gameSuggestions, setGameSuggestions] = useState([]);
  const [gameSearchValue, setGameSearchValue] = useState("");
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("");
  const [profitShare, setProfitShare] = useState("");
  const [escrow, setEscrow] = useState("");
  const [gameType, setGameType] = useState(0);
  const [apiId, setApiId] = useState("");
  const [sanitaryId, setSanitaryId] = useState(true);
  const [sanitaryPercent, setSanitaryPercent] = useState(true);
  const [sanitaryThreshold, setSanitaryThreshold] = useState(true);

  const createStakingRequest = async () => {
    const { accounts, contract, onHide, tokenContract } = props;
    const gameOrTournamentFromApi = await fetchGameOrTournamentFromApi()
    const apiIdExists = Object.keys(gameOrTournamentFromApi).length !== 0
    const percentCorrect = checkPercentCorrect()
    const thresholdCorrect = checkThresholdIsEqualOrLower()
    setSanitaryId(apiIdExists);
    setSanitaryPercent(percentCorrect);
    setSanitaryThreshold(thresholdCorrect);
    if (apiIdExists && percentCorrect && thresholdCorrect) {
      try {
        const amountString = "0x" + (amount * 1e18).toString(16);
        const escrowString = "0x" + (escrow * 1e18).toString(16);
        const playThresholdString = "0x" + (threshold * 1e18).toString(16);
        await tokenContract.methods.approve(contract.options.address, escrowString).send({from: accounts[0]});
        await contract.methods.createRequest(amountString, profitShare, escrowString, playThresholdString, gameType, apiId, gameOrTournamentFromApi.scheduledFor)
          .send({ from: accounts[0] });
        props.reloadContractState();
        onHide();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const checkThresholdIsEqualOrLower = () => {
    return (0 <= parseFloat(threshold) && parseFloat(threshold) <= parseFloat(amount))
  }

  const checkPercentCorrect = () => {
    return (0 <= parseFloat(profitShare) && parseFloat(profitShare) <= 100)
  }

  const fetchFutureGamesAndTournaments = async () => {
    // console.log(process.env.REACT_APP_STATS_API_URL);
    const tournaments = await fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments?completed=false`,
        {
          method: "GET",
          mode: "cors",
          headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json());

    const games = await fetch(`https://safe-stake-mock-api.herokuapp.com/games?completed=false`,
        {
          method: "GET",
          mode: "cors",
          headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json());
      
    setFutureTournaments(tournaments);
    setFutureGames(games);
  }

  const fetchGameOrTournamentFromApi = async () => {
    if (apiId === "") return false;
    if (gameType === GameType.SingleGame) {
      return await fetch(`https://safe-stake-mock-api.herokuapp.com/games/${apiId}`,
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
    } else {
      return await fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments/${apiId}`,
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
    }
  }

  useEffect(() => {
    fetchFutureGamesAndTournaments();
  }, [])

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  }

  const handleThresholdChange = (event) => {
   setThreshold(event.target.value);
  }

  const handleProfitShareChange = (event) => {
    setProfitShare(event.target.value);
  }

  const handleEscrowChange = (event) => {
    setEscrow(event.target.value);
  }

  const getSuggestions = (value) => {
    const suggestions = gameType === 0 ? futureGames : futureTournaments;
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : Object.entries(suggestions).filter(entry => {
        return entry[1].name.toLowerCase().slice(0, inputLength) === inputValue
    });
  }

  const onSuggestionsFetchRequested = ({ value }) => {
    setApiId("");
    setGameSuggestions(getSuggestions(value));
  }

  const onSuggestionsClearRequested = () => {
    setGameSuggestions([]);
  }

  const onGameSearchChanged = (event, { newValue }) => {
    setGameSearchValue(newValue);
  }

  const getSuggestionValue = suggestion => {
    setApiId(suggestion[0]);
    return suggestion[1].name;
  }

  const gameTypes = [
    { name: "Single Game", value: 0 },
    { name: "Tournament", value: 1 }
  ]

  const suggestionInputProps = {
    placeholder: 'Start typing the name of your game/tournament',
    value: gameSearchValue,
    onChange: onGameSearchChanged
  };

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create New Staking Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Amount I'm looking for (◈)</Form.Label>
            <Form.Control value={amount} onChange={(event) => handleAmountChange(event)} inputMode="numeric" placeholder="e.g. 100" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Minimum threshold (◈)</Form.Label>
            { !sanitaryThreshold &&
            <p style={{color: "red", marginTop:"-0.5em"}}>
              Make sure you enter a valid Threshold! (Less than amount requested and greater than 0)
            </p>
            }
            <Form.Control value={threshold} onChange={(event) => handleThresholdChange(event)} inputMode="numeric" placeholder="e.g. 100" />
            <Form.Text className="text-muted">
              This is the minimum amount of money you are willing to be staked in order to play the game or
              tournament. For example, if the minimum amount I'm looking for in order to enter the tournament/game
              is 50◈ then when my staking request reaches 50◈, I will receive the funds immediately. If I do not
              manage to collect 50◈, SafeStake will give the money back to the respective investors automatically.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Profit Sharing Percentage (%) </Form.Label>
            { !sanitaryPercent &&
                <p style={{color: "red", marginTop:"-0.5em"}}>
                  Make sure you enter a valid Percentage!
                </p>
            }
            <Form.Control value={profitShare} onChange={(event) => handleProfitShareChange(event)} inputMode="numeric" placeholder="e.g. 50" />
            <Form.Text className="text-muted">
              If the amount I'm looking for is 50 ◈, and profit sharing
              percentage is 50% and I make 50 ◈ in profit. I must return to the
              investor 75 ◈ (50 ◈ original investment + 50 ◈ profit * 0.5)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Escrow Amount (◈)</Form.Label>
            <Form.Control value={escrow} onChange={(event) => handleEscrowChange(event)} inputMode="numeric" placeholder="e.g. 50" />
            <Form.Text className="text-muted">
              If you would like to provide some collateral to increase the trust involved in transaction please specify the amount here.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game Type</Form.Label>
            { gameTypes.map((gt) => <Form.Check type="radio" key={gt.name} label={gt.name} checked={gameType === gt.value} onChange={() => setGameType(gt.value)} />) }
            <Form.Text className="text-muted">
              Select the type of game you are playing in.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game/Tournament ID</Form.Label>
            { !sanitaryId &&
                <p style={{color: "red", marginTop:"-0.5em"}}>
                  Make sure you SELECT a Game or Tournament!
                </p>
            }
            <Autosuggest 
                suggestions={gameSuggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={suggestionInputProps}/>
            <Form.Text className="text-muted">
              Please select the tournament or game you wish to be staked in
            </Form.Text>
          </Form.Group>

          <Button
            onClick={(event) => {event.preventDefault(); createStakingRequest();}}
            variant="primary"
            // type="submit"
          >
            Submit
          </Button>
          
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Col>
        { !(sanitaryId || sanitaryPercent) &&
          <p style={{color: "red"}}>
            Make sure all your entries are valid!
          </p>
        }
        </Col>
        <Col>
        <Button onClick={props.onHide} style={{float: "right"}}>Close</Button>
        </Col>
      </Modal.Footer>
    </Modal>
  );
}

export default NewStakingRequestForm;
