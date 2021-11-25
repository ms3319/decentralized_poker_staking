import React, {useState} from "react";
import PlayerCard from "./PlayerCard.js";
import { Container } from "react-bootstrap";
import PlayerCardModalForm from "./PlayerCardModalForm.js";
import styles from "./Stable.module.css"
import Button from "./Button";
import {Link} from "react-router-dom";

const Separator = () => <div className={styles.separator} />

const MarketPlaceRedirect = () => (
  <div className={styles.marketPlaceRedirect}>
    <h1>No Investment Activity</h1>
    <p>Visit the marketplace to make your first investments!</p>
    <Link to="/"><Button>Visit Marketplace</Button></Link>
  </div>
)

export default function Stable(props) {
  const [stakeInFocus, setStakeInFocus] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setStakeInFocus(null);
  }
  const handleShow = (stake) => {
    setStakeInFocus(stake);
    setShow(true);
  }

  if (
    props.accounts === null ||
    props.requests === null ||
    props.contract == null
  )
    return null;

  let investor = props.accounts[0];
  let investments = props.requests.filter(
    (request) => request.backer === investor
  );

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1>My Stable</h1>
          <p className={styles.pageDescription}>View the status of your current and past investments. If a player is overdue on their repayment, you will also be able to claim the escrow from this page.</p>
        </div>
        <Separator />
        {investments.length === 0 ?
          <MarketPlaceRedirect />
        :
          investments.map((stake, i) => (
            <button
              onClick={() => handleShow(stake)}
              style={{ padding: 0, border: "none", background: "none" }}
              key={i}
            >
              {/* TODO: Give this a better name */}
              <PlayerCard
                stake={stake}
                contract={props.contract}
                bg={stake[0].toLowerCase()}
                text={stake[0] === "Dark" ? "light" : "dark"}
                style={{
                  width: "24rem",
                  height: "16rem",
                  float: "left",
                  margin: "15px",
                  border: "solid black 1px",
                }}
                className="mb-2"
              />
            </button>
          ))
        }
      </Container>
      {/* TODO: give this a better name */}
      <PlayerCardModalForm
        contract={props.contract}
        accounts={props.accounts}
        stake={stakeInFocus}
        show={show}
        style={{ position: "absolute", left: "170px" }}
        handleClose={handleClose}
      />
    </div>
  );
}
