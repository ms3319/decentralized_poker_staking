import React, {useEffect, useState} from "react";
import StakingContract from "./contracts/Staking.json";
import { Button } from "react-bootstrap";
import NavBar from "./NavBar";
import StakingRequestDetails from "./StakingRequestDetails";
import NewStakingRequestForm from "./NewStakingRequestForm";
import { useWeb3React } from "@web3-react/core"
import { injected } from "./components/Connectors"
import { useEagerConnect } from "./hooks";

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StakeRequestList from "./StakeRequestList";

export default function Home() {
  const [requests, setRequests] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  const [focusedRequest, setFocusedRequest] = useState(null)
  const [showRequestDetails, setShowRequestDetails] = useState(false)
  const [showStakeRequestForm, setShowStakeRequestForm] = useState(false)

  const { active, library, activate } = useWeb3React()

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  useEagerConnect()

  const closeRequestDetails = () => {
    setShowRequestDetails(false);
  }

  const openRequestDetails = (request) => {
    setFocusedRequest(request)
    setShowRequestDetails(true)
  }

  const openStakeRequestForm = () => {
    setShowStakeRequestForm(true)
  }

  const closeStakeRequestForm = () => {
    setShowStakeRequestForm(false)
  }

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

  const connectWallet = async () => {
    try {
      await activate(injected)
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  return (
    <div className="App">
      <NavBar />

      <h1>Decentralised Poker Staking</h1>

      {!active && <Button onClick={connectWallet}>Connect</Button>}

      {active &&
        <>
          <button onClick={openStakeRequestForm}>
            Create Staking Request
          </button>
          <NewStakingRequestForm show={showStakeRequestForm} onHide={closeStakeRequestForm}
                                 accounts={accounts} contract={contract}/>

          <StakingRequestDetails contract={contract} accounts={accounts} request={focusedRequest} show={showRequestDetails} onHide={closeRequestDetails} />
          <StakeRequestList requests={requests} handleShowRequestDetails={openRequestDetails} />
        </>
      }
    </div>
  );
}
