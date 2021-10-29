import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import Home from "./Home";

function getLibrary(provider) {
  return new Web3(provider)
}

export default function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Home />
    </Web3ReactProvider>
  )
}