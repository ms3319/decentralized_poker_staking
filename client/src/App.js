import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import StakingContract from "./contracts/Staking.json";
import { Card, Col, Button, Row } from "react-bootstrap";
import CustomBar from "./CustomBar";
import CentredModal from "./CentredModal";
import NewStakingRequestForm from "./NewStakingRequestForm";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Stable from "./Stable.js";
import {BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Competitions from "./Competitions";

class App extends Component {
  state = { userList: null, web3: null, accounts: null, contract: null, modalShow: false, stakeList: null, stakeRequestFormShow: false};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StakingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        StakingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const requestCount = await instance.methods.requestCount().call();
      console.log(requestCount);
      var requests = []
      for (var i = 0; i < requestCount; i++) {
        requests.push(await instance.methods.getStake(i).call());
      }

      console.log(requests);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ requests, web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  addToUserList = async () => {
    const { accounts, contract } = this.state;

    await contract.methods.add().send({ from: accounts[0] }); //TODO: What does this do?

    const newList = await contract.methods.getUsers().call();

    this.setState({ userList: newList });
  }

  handleClose = async () => {
    this.setState({ modalShow: false });
  }

  handleShow = async () => {
    this.setState({ modalShow: true });
  }

  openStakeRequestForm = async () => {
    this.setState({stakeRequestFormShow: true});
  }

  closeStakeRequestForm = async () => {
    this.setState({stakeRequestFormShow: false});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Router>
      <div className="App">
        <CustomBar />
        <Switch>
          <Route exact path = '/' >
        <button onClick={this.openStakeRequestForm}>
          Create Staking Request
        </button>
        <NewStakingRequestForm show={this.state.stakeRequestFormShow} onHide={this.closeStakeRequestForm} 
            accounts={this.state.accounts} contract={this.state.contract}/>

        <p>
          Click the button to add yourself to the list
        </p>
        <button
          className="App-link"
          onClick={this.addToUserList}
        >
          Add myself to list
        </button>
        <p>The list is dislayed here:</p>
        {this.state.requests.length === 0 ? "empty" : this.state.requests.filter(request => request.status === "0").map((request) => 
          <Card key={request.id} style={{backgroundColor:"#5f9ea0", width:"55rem", marginLeft:"auto", marginRight:"auto", marginBottom:"1rem", borderRadius:"10px", boxShadow: "5px 5px 2px grey"}}>
            <Card.Body> 
              <Row>
              <Col>
              {request.horse}
              </Col>
              <Col>
              {request.amount}
              </Col>
              <Col>
              {request.profitShare}
              </Col>
              <Col xs={3}>
              <Button onClick={this.handleShow} style={{backgroundColor:"#ff9800", borderColor:"grey", color:"black"}}>
              View More
              </Button>
              <CentredModal contract={this.state.contract} accounts={this.state.accounts} request={request} show={this.state.modalShow} onHide={this.handleClose} />
              </Col>
              </Row>
            </Card.Body>
          </Card>)}
          </Route>
          <Route exact path = "/myStable">
            <Stable/>
            </Route>
            <Route exact path = "/myGames">
               <Competitions/>
              </Route>
          </Switch>
      </div>
      </Router>
    );
  }
}

export default App;
