import Card from "react-bootstrap/Card";
import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function PlayerCard(props) {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (props.contract != null) {
      props.contract.methods.getPlayer(props.stake.horse).call().then((player) => {setPlayer(player)})
    }
  }, [props.contract, props.stake]);


  return (
    <Card {...props}>
      <Card.Body>
        <Row>
          <Col>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              {player ? player.name : ""} ({props.stake.horse})
            </div>
          </Col>
        </Row>      
        <Row>
          <Col md="auto">
            {" "}
            <img
              src="../charlie-chaplin-icon.png"
              className="rounded float-left"
              alt="Charlie Chaplin"
            ></img>{" "}
          </Col>
          <Col style={{"display": "flex", "justifyContent": "center", "alignItems": "center"}}>
            <div> {/* Used the div in order to main separation betweeen rows */}
            <Row style={{"justifyContent": "center", "display": "flex"}}>Playing in</Row>
            <Row style={{"justifyContent": "center", "display": "flex"}}>Poker Tournament X</Row>
            </div>
          </Col>
        </Row>
        
      </Card.Body>
    </Card>
  );
}
