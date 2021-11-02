import { Web3ReactProvider } from "@web3-react/core";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <NavBar />
        <Route exact path={"/"}>
          <Home />
        </Route>
        <Route exact path = "/my-stable">
          <Stable />
        </Route>
        <Route exact path = "/my-games">
          <Competitions />
        </Route>
      </Router>
    </Web3ReactProvider>
  )
}