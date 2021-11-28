import React, {useState} from "react";
import HomepageHeader from "./HomepageHeader";
import Button from "./Button";
import styles from "./About.module.css"
import { Row, Col, Modal } from "react-bootstrap";
import metamaskIcon from './images/metamask-icon.png'

export default function About(props) {
    const openInNewTab = (url) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const onClickUrl = (url) => {
        return () => openInNewTab(url)
      }

    const [showPlayer, setShowPlayer] = useState(false);
    const [showInvestor, setShowInvestor] = useState(false);

    const handleClosePlayer = () => setShowPlayer(false);
    const handleShowPlayer = () => setShowPlayer(true);

    const handleCloseInvestor = () => setShowInvestor(false);
    const handleShowInvestor = () => setShowInvestor(true);

    return (
        <div className={styles.about}>
            <HomepageHeader />
            <div style={{marginTop: "2em", marginLeft:"15em", marginRight:"15em", marginBottom: "2em"}}>
                <Row>
                    <h1>About us</h1>
                    <p>
                        SafeStake is a decentralised app that provides poker players with a platform to advertise a staking request, 
                        while allowing potential investors to possibly make a profit with them according to a mutually agreed contract. 
                        In order to use our website, you need to make sure that you have the MetaMask Chrome extension, and that you are 
                        able to connect your wallet to the Ropsten network.
                    </p>
                </Row>
                <Row style={{marginBottom:"2em"}}>
                    <Col>
                    <Button icon={metamaskIcon} onClick={onClickUrl("https://metamask.io/download")}>Download Metamask</Button>
                    </Col>
                </Row>
                <Row>
                    <p>
                        In order to understand the features of SafeStake further, 
                        please click on the specific button for a walk through of the steps for a potential player by clicking the player
                        button, or the investor button for potential investors.
                    </p>
                </Row>
                <Row>
                    <Col style={{marginRight: "-8em"}}>
                    <Button onClick={handleShowPlayer}>Player</Button>
                    </Col>
                    <Col style={{marginLeft: "-8em"}}>
                    <Button onClick={handleShowInvestor}>Investor</Button>
                    </Col>
                </Row>
            </div>
            <Modal show={showPlayer} onHide={handleClosePlayer} style={{}}>
                <Modal.Header closeButton>
                <Modal.Title>Walkthrough as a player</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <ul>
                    <li>From a player's perspective, after signing up with our platform you are then able to go on the platform's main page and 'set up a new staking request' where you are able to disclose details about the money you require for the buy in, the profit percentage return for the potential investor and even declare the amount of money you will put in escrow.</li>
                    <li>Escrows are not required, however you are more likely to receive investment due to higher trust. </li>
                    <li>You are then able to go to the 'My Games' page where you are able to see all of your received investments, and when you click on a respective investment you will be able to see all of the details agreed when making the transaction.</li>
                    <li>When a game/tournament has completed and the player has made profit, the player is then able to return the money owed to the investor through the respective investment tile on the 'My Games' page, where a button allowing the player to pay back will appear.</li>
                    <li>If the player does not return the profits 10 days after completing the game/tournament, the investor is then allowed to claim the escrow set up in the contract agreement.</li>
                </ul>
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={handleClosePlayer}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showInvestor} onHide={handleCloseInvestor}>
                <Modal.Header closeButton>
                <Modal.Title>Walkthrough as an investor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <ul>
                    <li>From an investor's perspective, you can go to the SafeStake's main page and view the list of proposed stakes by poker players in a various range of games and tournaments.</li>
                    <li>You are able to click on a specific stake proposal in order to view more details before investing.</li>
                    <li>Details can include things such as a link to the player's details on the SafeStake platform, a link to the player's sharkscope profile, disclosed escrow amount as well as the fundamental profit share and money requested details.</li>
                    <li>After investing in a player and the respective tournament/game has completed, the player will be able to return the profit share agreed upon creating the contract (if the player has made a profit), and this has to be done within 10 days.</li>
                    <li>After those 10 days, if the player has not returned the profit due, as an investor you are then entitled to request the escrow amount agreed upon.</li>
                </ul>
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={handleCloseInvestor}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}