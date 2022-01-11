import React, {useEffect, useState} from "react";
import StakingContract from "./contracts/Staking.json";
import Token from "./contracts/Token.json";
import { useWeb3React } from "@web3-react/core"
import { useEagerConnect } from "./hooks";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from "./Home";
import Stable from "./Stable";
import NavBar from "./NavBar";
import Player from "./Player"
import About from "./About"
import {isNullAddress} from "./utils";
require('./globals.css')

// TODO: Get the stake coin instance and pass it down to the other components here


export default function App() {
  const [requests, setRequests] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  const [hasPlayerAccount, setHasPlayerAccount] = useState(false)
  const [tokenContract, setTokenContract] = useState(null);
  const [player, setPlayer] = useState(null);
  const [reloadStateToggle, setReloadStateToggle] = useState(false);

  const reloadContractState = () => {
    setReloadStateToggle(!reloadStateToggle);
  }

  const { active, library } = useWeb3React()

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  useEagerConnect()

  // When the active variable changes, load the contract and requests from web3 provider
  useEffect(() => {
    async function getContractData() {
      if (!active) {
        return
      }
      const accounts = await library.eth.getAccounts()

      // Get the contract instance.
      const networkId = await library.eth.net.getId();
      const deployedNetwork = StakingContract.networks[networkId];
      const tokenContract = new library.eth.Contract(Token.abi, deployedNetwork && "0xFDe1260d74D0E126d09a65037eF650bB7E320614");
      const contract = new library.eth.Contract(
        StakingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const requestCount = await contract.methods.requestCount().call();
      const requests = [];
      for (let i = requestCount - 1; i >= 0; i--) {
        requests.push(await contract.methods.getStake(i).call());
      }
      const player = await contract.methods.getPlayer(accounts[0]).call();
      if (!isNullAddress(player.playerAddress)) {
        setHasPlayerAccount(true);
        setPlayer(player);
      }
      setContract(contract)
      setRequests(requests)
      setAccounts(accounts)
      setTokenContract(tokenContract);
    }
    getContractData().catch()
  }, [active, library, reloadStateToggle])


  return (
      <Router>
        <NavBar hasPlayerAccount={hasPlayerAccount} />
        <Route exact path={"/"}>
          <Home reloadContractState={reloadContractState} player={player} hasPlayerAccount={hasPlayerAccount} requests={requests} accounts={accounts} contract={contract} tokenContract={tokenContract} />
        </Route>
        <Route exact path = "/about">
          <About />
        </Route>
        <Route exact path = "/my-stable">
          <Stable reloadContractState={reloadContractState} requests={requests} accounts={accounts} contract={contract} tokenContract={tokenContract} />
        </Route>
        <Route exact path = "/players/:playerAddress">
          <Player reloadContractState={reloadContractState} contract={contract} accounts={accounts} tokenContract={tokenContract} />
        </Route>
      </Router>
  )
}