import React from "react";
import PlayerCard from "./PlayerCard.js";
import { Container } from "react-bootstrap";
import { useState } from "react";
import "./Stable.css";
import PlayerCardModalForm from "./PlayerCardModalForm.js";

export default function Stable(props) {
  const [stakeInFocus, setStakeInFocus] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setStakeInFocus(null);
  }
  const handleShow = (stake) => {
    console.log(stake);
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

  if (investments.length === 0) {
    return (
      <div>
        <h1 align="center">Stable is empty</h1>
        <h3 align="center">You have not staked any games</h3>
      </div>
    );
  }

  return (
    <div className="Stable" style={{ overflowY: "scroll" }}>
      <Container
        style={{
          position: "absolute",
          left: "170px",
          backgroundColor: "white",
        }}
        fluid={true}
      >
        {investments.map((stake, i) => (
          <button
            onClick={() => handleShow(stake)}
            style={{ padding: 0, border: "none", background: "none" }}
          >
            {/* TODO: Give this a better name */}
            <PlayerCard
              stake={stake}
              bg={stake[0].toLowerCase()}
              key={i}
              text={stake[0] === "Dark" ? "light" : "dark"}
              style={{
                width: "22rem",
                height: "14rem",
                float: "left",
                margin: "15px",
                border: "solid black 1px",
              }}
              className="mb-2"
            />
          </button>
        ))}
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
