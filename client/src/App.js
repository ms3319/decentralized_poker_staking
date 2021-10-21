import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import UserListContract from "./contracts/UserList.json";
import { Card } from "react-bootstrap";
import CustomBar from "./CustomBar";

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  state = { userList: null, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = UserListContract.networks[networkId];
      const instance = new web3.eth.Contract(
        UserListContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const userList = await instance.methods.getUsers().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ userList, web3, accounts, contract: instance });
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

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <CustomBar />
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
        {this.state.userList.length === 0 ? "empty" : this.state.userList.map((user) => 
          <Card style={{backgroundColor:"#5f9ea0", width:"55rem", marginLeft:"auto", marginRight:"auto", marginBottom:"1rem", borderRadius:"10px"}}>
            <Card.Body> 
              {user}
            </Card.Body>
          </Card>)}
      </div>
    );
  }
}

export default App;
