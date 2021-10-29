import React, {useEffect, useState} from "react";
import StakingContract from "./contracts/Staking.json";
import { Card, Col, Button, Row } from "react-bootstrap";
import CustomBar from "./CustomBar";
import CentredModal from "./CentredModal";
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
  const [modalShow, setModalShow] = useState(false)
  const [stakeRequestFormShow, setStakeRequestFormShow] = useState(false)

  const { active, account, library, connector, activate, deactivate, error } = useWeb3React()

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  const handleClose = () => {
    setModalShow(false);
  }

  const handleShow = () => {
    setModalShow(true)
  }

  const openStakeRequestForm = () => {
    setStakeRequestFormShow(true)
  }

  const closeStakeRequestForm = () => {
    setStakeRequestFormShow(false)
  }

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
      console.log("Connected successfully!")
      setContract(contract)
      setRequests(requests);
    }
    getContractData()
  }, [active])

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
      <CustomBar />

      <h1>Decentralised Poker Staking</h1>

      {!active && <Button onClick={connectWallet}>Connect</Button>}

      {active &&
        <>
          <button onClick={openStakeRequestForm}>
            Create Staking Request
          </button>
          <NewStakingRequestForm show={stakeRequestFormShow} onHide={closeStakeRequestForm}
                                 accounts={accounts} contract={contract}/>

          // TODO: currently the wrong modal (actually, all modals) shows up... need to fix this ASAP
          <StakeRequestList requests={requests} handleShowRequestDetails={handleShow} contract={contract} accounts={accounts} showRequestDetails={modalShow} handleCloseRequestDetails={handleClose} />
        </>
      }
    </div>
  );

  // return (
  //   <div>
  //     <button onClick={connect2}>Connect</button>
  //     {active ? <span>Connected with {account}</span> : <span>Not Connected</span>}
  //   </div>
  // )
}
