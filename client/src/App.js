import React, {useEffect, useState} from "react";
import StakingContract from "./contracts/Staking.json";
import { useWeb3React } from "@web3-react/core"
import { useEagerConnect } from "./hooks";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from "./Home";
import Stable from "./Stable";
import Competitions from "./Competitions";
import NavBar from "./NavBar";
import Player from "./Player"
require('./globals.css')


export default function App() {
  const [requests, setRequests] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)

  const { active, library } = useWeb3React()

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  useEagerConnect()

  // When the active variable changes, load the contract and requests from web3 provider
  useEffect(() => {
    async function getContractData() {
      if (!active) {
        return
      }
      setAccounts(await library.eth.getAccounts())

      // Get the contract instance.
      const networkId = await library.eth.net.getId();
      const deployedNetwork = StakingContract.networks[networkId];
      const contract = new library.eth.Contract(
        StakingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const requestCount = await contract.methods.requestCount().call();
      const requests = [];
      for (let i = 0; i < requestCount; i++) {
        requests.push(await contract.methods.getStake(i).call());
      }
      setContract(contract)
      setRequests(requests);
    }
    getContractData()
  }, [active, library])


  return (
      <Router>
        <NavBar />
        <Route exact path={"/"}>
          <Home requests={requests} accounts={accounts} contract={contract} />
        </Route>
        <Route exact path = "/my-stable">
          <Stable requests={requests} accounts={accounts} contract={contract}/>
        </Route>
        <Route exact path = "/my-games">
          <Competitions />
        </Route>
        <Route exact path = "/players/:playerAddress">
          <Player contract={contract} dummy={123}/>
        </Route>
      </Router>
  )
}