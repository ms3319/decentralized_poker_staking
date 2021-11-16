import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"
import { CoinGeckoClient, usdToWei } from "./utils";
import { Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";


class NewStakingRequestForm extends Component {
  state = { amount: 0, profitShare: 0, escrow: 0, ethPriceUsd: 0, weiAmount: 0, weiEscrow: 0, gameType:0, apiId: "", sanitaryId: true, sanitaryPercent: true};

  createStakingRequest = async () => {
    const { accounts, contract } = this.props;
    // TODO: sanity check the values here before if statement
    // console.log("About to check if api id exists")
    const apiIdExists = await this.checkIfApiIdExists()
    const percentCorrect = this.checkPercentCorrect()
    // console.log(`api id exists: ${apiIdExists}`)
    this.setState({ sanitaryId: apiIdExists, sanitaryPercent: percentCorrect })
    if (apiIdExists && this.state.escrow > 0 && percentCorrect) {
      try {
        await contract.methods.createRequest(this.state.weiAmount.toString(), this.state.profitShare, this.state.weiEscrow.toString(), this.state.gameType, this.state.apiId)
          .send({ from: accounts[0], value: this.state.weiEscrow });
      } catch (error) {
        const response = JSON.parse(error.message.split("'")[1]);
        console.log(response.value);
        console.log(response.value.data.data);
        console.log(Object.keys(response.value.data.data));
        console.log(response.value.data.data[Object.keys(response.value.data.data)[0]]);
      }
    } else if (apiIdExists && percentCorrect) {
      try {
        await contract.methods.createRequest(this.state.weiAmount.toString(), this.state.profitShare, this.state.weiEscrow.toString(), this.state.gameType, this.state.apiId)
          .send({ from: accounts[0] });
      } catch (error) {
        const response = JSON.parse(error.message.split("'")[1]);
        console.log(response.value);
        console.log(response.value.data.data);
        console.log(Object.keys(response.value.data.data));
        console.log(response.value.data.data[Object.keys(response.value.data.data)[0]]);
      }
    }
  };

  checkPercentCorrect() {
    return (this.state.profitShare <= 100)
  }

  async checkIfApiIdExists() {
    if (this.state.gameType === 0) {
      return await fetch(`http://localhost:8000/games/${this.state.apiId}`, 
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => Object.keys(data).length !== 0)
    } else {
      return await fetch(`http://127.0.0.1:8000/tournaments/${this.state.apiId}`,
      { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => Object.keys(data).length !== 0)
    }
  }

  componentDidMount() {
    CoinGeckoClient.simple.price({ids: ['ethereum'], vs_currencies: ['usd']}).then(resp => this.setState({ethPriceUsd: resp.data.ethereum.usd}));
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

  render() {
    const gameTypes = [
      { name: "Single Game", value: 0 },
      { name: "Tournament", value: 1 }
    ]

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
                    Make sure you enter a valid Game/Tournament ID!
                  </p>
              }
              <Form.Control value={this.state.apiId} onChange={(event) => this.handleApiIdChange(event)} inputMode="string" placeholder="e.g. -MnVll18N3qLF-Z2bVoU" />
              <Form.Text className="text-muted">
                Please provide the unique identifier of the game you wish to be staked in
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
          { !this.state.sanitaryId &&
            <p style={{color: "red"}}>
              Make sure you enter a valid Game/Tournament ID!
            </p>
          }
          </Col>
          <Col>
          <Button onClick={this.props.onHide}>Close</Button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default NewStakingRequestForm;
