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
require('./globals.css')

// TODO: Get the stake coin instance and pass it down to the other components here


export default function App() {
  const [requests, setRequests] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  const [hasPlayerAccount, setHasPlayerAccount] = useState(false)
  const [tokenContract, setTokenContract] = useState(null);

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
      const tokenContract = new library.eth.Contract(Token.abi, deployedNetwork && "0x1B286d86Cb9bd691f013D867d1682A97130d4557");
      const contract = new library.eth.Contract(
        StakingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const requestCount = await contract.methods.requestCount().call();
      const requests = [];
      for (let i = requestCount - 1; i >= 0; i--) {
        requests.push(await contract.methods.getStake(i).call());
      }
      setHasPlayerAccount((await contract.methods.getPlayer(accounts[0]).call()).playerAddress !== "0x0000000000000000000000000000000000000000")
      setContract(contract)
      setRequests(requests)
      setAccounts(accounts)
      setTokenContract(tokenContract);
    }
    getContractData().catch()
  }, [active, library])


  return (
      <Router>
        <NavBar hasPlayerAccount={hasPlayerAccount} />
        <Route exact path={"/"}>
          <Home hasPlayerAccount={hasPlayerAccount} requests={requests} accounts={accounts} contract={contract} tokenContract={tokenContract} />
        </Route>
        <Route exact path = "/my-stable">
          <Stable requests={requests} accounts={accounts} contract={contract} tokenContract={tokenContract} />
        </Route>
        <Route exact path = "/players/:playerAddress">
          <Player contract={contract} accounts={accounts} tokenContract={tokenContract} />
        </Route>
      </Router>
  )
}