import React, {useState, useEffect} from "react";
import {Col, Container, Row, Form} from "react-bootstrap";
import NewStakingRequestForm from "./NewStakingRequestForm";
import NewPlayerForm from "./NewPlayerForm";
import HomepageHeader from "./HomepageHeader";
import { injected } from "./components/Connectors"
import metamaskIcon from './images/metamask-icon.png'
import addIcon from './images/add.svg'
import filterIcon from './images/filter.svg'
import deleteIcon from './images/delete.svg'

import styles from './Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StakeRequestList from "./StakeRequestList";
import Button from "./Button";
import { useWeb3React } from "@web3-react/core";
import StakeDetails from "./StakeDetails";
import {GameType, StakeStatus} from "./utils";

export default function Home(props) {
  
  const [focusedRequest, setFocusedRequest] = useState(null)
  const [focusedPlayer, setFocusedPlayer] = useState(null)
  const [focusedRequestName, setFocusedRequestName] = useState("")
  const [showRequestDetails, setShowRequestDetails] = useState(false)
  const [showStakeRequestForm, setShowStakeRequestForm] = useState(false)
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false)
  const [stakesToShow, setStakesToShow] = useState([]);
  const [minAmountToSearch, setMinAmountToSearch] = useState("");
  const [maxAmountToSearch, setMaxAmountToSearch] = useState("");

  const {active, activate} = useWeb3React();
  
  useEffect(() => {
    if (props.requests) {
      const propsRequestCopy = props.requests;
      setStakesToShow(propsRequestCopy.filter(request => request.status === StakeStatus.Requested || request.status === StakeStatus.PartiallyFilled));
    }
  }, [props.requests]);

  const closeRequestDetails = () => {
    setShowRequestDetails(false);
  }

  const onMinAmountSearchChanged = (event) => {
    setMinAmountToSearch(event.target.value);
  }

  const onMaxAmountSearchChanged = (event) => {
    setMaxAmountToSearch(event.target.value);
  }

  const filterRequests = () => {
    let propsRequestCopy = props.requests;
    propsRequestCopy = propsRequestCopy.filter(request => request.status === StakeStatus.Requested || request.status === StakeStatus.PartiallyFilled);
    setStakesToShow(propsRequestCopy.filter(stake => {
      return (minAmountToSearch !== "" ? stake.amount / 1e18 >= minAmountToSearch : true) && (maxAmountToSearch !== "" ? stake.amount / 1e18 <= maxAmountToSearch : true);
    }));
  }

  const clearFilter = () => {
    let propsRequestCopy = props.requests;
    propsRequestCopy = propsRequestCopy.filter(request => request.status === StakeStatus.Requested || request.status === StakeStatus.PartiallyFilled);
    setStakesToShow(propsRequestCopy);
    setMinAmountToSearch("");
    setMaxAmountToSearch("");
  }

  const fillStake = async (id, amount) => {
    const amountString = "0x" + parseInt(amount).toString(16);
    await props.tokenContract.methods.approve(props.contract.options.address, amountString).send({from: props.accounts[0]});
    await props.contract.methods.stakeHorse(id, amountString).send({ from: props.accounts[0] })
      .then(() => {props.reloadContractState()})
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
       
          <div className={styles.filterForm}>
            <Form>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Minimum Stake Request</Form.Label>
                    <Form.Control value={minAmountToSearch} onChange={(event) => onMinAmountSearchChanged(event)} inputMode="numeric" placeholder="e.g. 50" />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Maximum Stake Request</Form.Label>
                    <Form.Control value={maxAmountToSearch} onChange={(event) => onMaxAmountSearchChanged(event)} inputMode="numeric" placeholder="e.g. 250000" />
                  </Form.Group>
                </Col>
              </Row>
              <Row className={styles.filterButtonRow}>
                <Col>
                  <Button icon={filterIcon} onClick={(event) => {event.preventDefault(); filterRequests();}}>
                    Filter 
                  </Button>
                </Col>
                <Col>
                  <Button icon={deleteIcon} onClick={(event) => {event.preventDefault(); clearFilter();}}>
                    Clear Filter 
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <StakeDetails namedInvestment={[focusedPlayer, focusedRequestName, focusedRequest]} onHide={closeRequestDetails} show={showRequestDetails} timeUntilCanClaimEscrow={null} claimEscrow={() => {}} fillStake={fillStake} viewerIsPlayer={focusedPlayer && focusedPlayer.playerAddress === props.accounts[0]} viewerIsBacker={focusedRequest && focusedRequest.backer === props.accounts[0]}/>
          <h2>Staking Requests</h2>
          <div className={styles.stakingListContainer}>
            <StakeRequestList contract={props.contract} requests={stakesToShow} handleShowRequestDetails={openRequestDetails} />
          </div>
        </div>
      }
    </div>
  );
}
