import React, {useEffect, useState} from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Web3 from "web3";
import Home from "./Home";
import Stable from "./Stable";
import Competitions from "./Competitions";
import NavBar from "./NavBar";
require('./globals.css')

function getLibrary(provider) {
  return new Web3(provider)
}

export default function App() {
  const [requests, setRequests] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <NavBar />
        <Route exact path={"/"}>
          <Home requests={requests} accounts={accounts} contract={contract}
                setRequests={setRequests} setAccounts={setAccounts} setContract={setContract}/>
        </Route>
        <Route exact path = "/my-stable">
          <Stable requests={requests} accounts={accounts} contract={contract}/>
        </Route>
        <Route exact path = "/my-games">
          <Competitions />
        </Route>
      </Router>
    </Web3ReactProvider>
  )
}