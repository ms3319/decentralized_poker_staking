import React, {useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import StakingRequestDetails from "./StakingRequestDetails";
import NewStakingRequestForm from "./NewStakingRequestForm";
import NewPlayerForm from "./NewPlayerForm";
import HomepageHeader from "./HomepageHeader";
import { injected } from "./components/Connectors"
import metamaskIcon from './images/metamask-icon.png'
import addIcon from './images/add.svg'

import styles from './Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StakeRequestList from "./StakeRequestList";
import Button from "./Button";
import { useWeb3React } from "@web3-react/core";
import StakeDetails from "./StakeDetails";
import {GameType} from "./utils";

export default function Home(props) {
  
  const [focusedRequest, setFocusedRequest] = useState(null)
  const [focusedPlayer, setFocusedPlayer] = useState(null)
  const [focusedRequestName, setFocusedRequestName] = useState("")
  const [showRequestDetails, setShowRequestDetails] = useState(false)
  const [showStakeRequestForm, setShowStakeRequestForm] = useState(false)
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false)

  const {active, activate} = useWeb3React();

  const closeRequestDetails = () => {
    setShowRequestDetails(false);
  }

  const openRequestDetails = (request, player) => {
    setFocusedRequest(request)
    setFocusedPlayer(player)
    if (player !== null) {
      if (parseInt(request.gameType) === GameType.SingleGame) {
        fetch(`https://safe-stake-mock-api.herokuapp.com/games/${request.apiId}`)
          .then(response => response.json())
          .then(game => setFocusedRequestName(game.name))
          .catch(() => (setFocusedRequestName("Unknown game")))
      } else {
        fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments/${request.apiId}`)
          .then(response => response.json())
          .then(tournament => setFocusedRequestName(tournament.name))
          .catch(() => (setFocusedRequestName("Unknown tournament")))
      }
    }
    setShowRequestDetails(true)
  }

  const openStakeRequestForm = () => {
    setShowStakeRequestForm(true)
  }

  const closeStakeRequestForm = () => {
    setShowStakeRequestForm(false)
  }

  const openNewPlayerForm = () => {
    setShowNewPlayerForm(true)
  }

  const closeNewPlayerForm = () => {
    setShowNewPlayerForm(false)
  }

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
    <div className={styles.home}>
      <HomepageHeader />

      {!active &&
        <div className={styles.mainContentContainer}>
          <h2>Connect your wallet to view the marketplace</h2>
          <Container style={{marginTop: "40px", width: "50%"}}>
            <Row style={{padding: "15px"}}>
              <Col>
                <Button icon={metamaskIcon} onClick={connectWallet}>Connect Metamask</Button>
              </Col>
            </Row>
          </Container>
        </div>
      }

      {active &&
        <div className={styles.mainContentContainer}>
          <h2>Marketplace</h2>
          {!props.hasPlayerAccount &&
            <Button style={{margin: "50px"}} onClick={openNewPlayerForm}>
              Sign up as a player
            </Button>
          }
          {props.hasPlayerAccount && props.player && props.player.canCreateStake && 
            <Button style={{margin: "50px 0 20px 0"}} icon={addIcon} onClick={openStakeRequestForm}>
              Create Staking Request
            </Button>
          }
          <NewStakingRequestForm reloadContractState={props.reloadContractState} show={showStakeRequestForm} onHide={closeStakeRequestForm}
                                 accounts={props.accounts} contract={props.contract} tokenContract={props.tokenContract} />
          <NewPlayerForm reloadContractState={props.reloadContractState} show={showNewPlayerForm} onHide={closeNewPlayerForm}
                                 accounts={props.accounts} contract={props.contract}/>
          <StakeDetails namedInvestment={[focusedPlayer, focusedRequestName, focusedRequest]} onHide={closeRequestDetails} show={showRequestDetails} timeUntilCanClaimEscrow={null} claimEscrow={() => {}}/>
          <div className={styles.stakingListContainer}>
            <StakeRequestList contract={props.contract} requests={props.requests} handleShowRequestDetails={openRequestDetails} />
          </div>
        </div>
      }
    </div>
  );
}
