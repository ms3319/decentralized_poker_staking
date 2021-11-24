import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"
import { CoinGeckoClient, usdToWei } from "./utils";
import { Col } from "react-bootstrap";
import Autosuggest from "react-autosuggest";
import "bootstrap/dist/css/bootstrap.min.css";

import "./Autosuggest.css"

// TODO: Figure out how tf to keep the whole suggestion object, as well as letting the user
// type their value in


const renderSuggestion = suggestion => (
  <span>
    {suggestion[1].name + " "}
    <span className="suggestion-id">
      {suggestion[0]}
    </span>
  </span>
)

class NewStakingRequestForm extends Component {
  state = { selectedSuggestion: null, futureTournaments: {}, futureGames: {}, gameSuggestions: [], gameSearchValue: "", amount: 0, profitShare: 0, escrow: 0, ethPriceUsd: 0, weiAmount: 0, weiEscrow: 0, gameType:0, apiId: "", sanitaryId: true, sanitaryPercent: true};

  createStakingRequest = async () => {
    const { accounts, contract, onHide } = this.props;
    const apiIdExists = await this.checkIfApiIdExists()
    const percentCorrect = this.checkPercentCorrect()
    this.setState({ sanitaryId: apiIdExists, sanitaryPercent: percentCorrect })
    if (apiIdExists && percentCorrect) {
      try {
        await contract.methods.createRequest(this.state.weiAmount.toString(), this.state.profitShare, this.state.weiEscrow.toString(), this.state.gameType, this.state.apiId)
          .send({ from: accounts[0], value: this.state.weiEscrow.toString() });
        onHide();
      } catch (error) {
        console.error(error);
      }
    }
  };

  checkPercentCorrect() {
    return (0 <= parseFloat(this.state.profitShare) && parseFloat(this.state.profitShare) <= 100)
  }

  async fetchFutureGamesAndTournaments() {
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
      
    this.setState({futureTournaments: tournaments, futureGames: games});
  }

  async checkIfApiIdExists() {
    if (this.state.apiId === "") return false;
    if (this.state.gameType === 0) {
      return await fetch(`https://safe-stake-mock-api.herokuapp.com/games/${this.state.apiId}`,
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => Object.keys(data).length !== 0)
    } else {
      return await fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments/${this.state.apiId}`,
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => Object.keys(data).length !== 0)
    }
  }

  componentDidMount() {
    CoinGeckoClient.simple.price({ids: ['ethereum'], vs_currencies: ['usd']}).then(resp => this.setState({ethPriceUsd: resp.data.ethereum.usd}));
    this.fetchFutureGamesAndTournaments();
  }

  handleAmountChange(event) {
    this.setState({weiAmount: usdToWei(event.target.value, this.state.ethPriceUsd)});
    this.setState({amount: event.target.value});
  }

  handleProfitShareChange(event) {
    this.setState({profitShare: event.target.value});
  }

  handleEscrowChange(event) {
    this.setState({escrow: event.target.value});
    this.setState({weiEscrow: usdToWei(event.target.value, this.state.ethPriceUsd)});
  }

  handleApiIdChange(event) {
    this.setState({apiId: event.target.value});
  }

  getSuggestions = (value) => {
    const suggestions = this.state.gameType === 0 ? this.state.futureGames : this.state.futureTournaments;
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : Object.entries(suggestions).filter(entry => {
        return entry[1].name.toLowerCase().slice(0, inputLength) === inputValue
    });
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({gameSuggestions: this.getSuggestions(value)});
  }

  onSuggestionsClearRequested = () => {
    this.setState({gameSuggestions: []});
  }

  onGameSearchChanged = (event, { newValue }) => {
    this.setState({gameSearchValue: newValue});
  }

  getSuggestionValue = suggestion => {
    this.setState({apiId: suggestion[0]});
    return suggestion[1].name;
  }

  render() {
    const gameTypes = [
      { name: "Single Game", value: 0 },
      { name: "Tournament", value: 1 }
    ]

    const { gameSearchValue, gameSuggestions } = this.state;

    const suggestionInputProps = {
      placeholder: 'Start typing the name of your game/tournament',
      value: gameSearchValue,
      onChange: this.onGameSearchChanged
    };

    return (
      <Modal
        {...this.props}
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
              <Form.Label>Amount I'm looking for ($)</Form.Label>
              <Form.Control value={this.state.amount} onChange={(event) => this.handleAmountChange(event)} inputMode="numeric" placeholder="e.g. 100" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profit Sharing Percentage (%) </Form.Label>
              { !this.state.sanitaryPercent &&
                  <p style={{color: "red", marginTop:"-0.5em"}}>
                    Make sure you enter a valid Percentage!
                  </p>
              }
              <Form.Control value={this.state.profitShare} onChange={(event) => this.handleProfitShareChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                If the amount I'm looking for is $50, and profit sharing
                percentage is 50% and I make $50 in profit. I must return to the 
                investor $75 ($50 original investment + $50 profit * 0.5) 
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Escrow Amount ($)</Form.Label>
              <Form.Control value={this.state.escrow} onChange={(event) => this.handleEscrowChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                If you would like to provide some collateral to increase the trust involved in this transaction please specify the amount here.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Game Type</Form.Label>
              { gameTypes.map((gameType) => <Form.Check type="radio" key={gameType.name} label={gameType.name} checked={this.state.gameType === gameType.value} onChange={() => this.setState({ gameType: gameType.value })} />) }
              <Form.Text className="text-muted">
                Select the type of game you are playing in.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Game/Tournament ID</Form.Label>
              { !this.state.sanitaryId &&
                  <p style={{color: "red", marginTop:"-0.5em"}}>
                    Make sure you SELECT a Game or Tournament!
                  </p>
              }
              <Autosuggest 
                  suggestions={gameSuggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  getSuggestionValue={this.getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={suggestionInputProps}/>
              <Form.Text className="text-muted">
                Please select the tournament or game you wish to be staked in
              </Form.Text>
            </Form.Group>

            <Button
              onClick={(event) => {event.preventDefault(); this.createStakingRequest();}}
              variant="primary"
              // type="submit"
            >
              Submit
            </Button>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Col>
          { !(this.state.sanitaryId || this.sanitaryPercent) &&
            <p style={{color: "red"}}>
              Make sure all your entries are valid!
            </p>
          }
          </Col>
          <Col>
          <Button onClick={this.props.onHide} style={{float: "right"}}>Close</Button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default NewStakingRequestForm;
