import Card from "react-bootstrap/Card";
import { Row, Col } from "react-bootstrap";
import { Component } from "react";

export default class PlayerCard extends Component {
  render() {
    return (
      <Card {...this.props}>
      <Card.Body>
        <Row>
          <Col>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              {this.props.stake.horse}
            </div>
          </Col>
          <Col md="auto">
            {" "}
            <img
              src="../charlie-chaplin-icon.png"
              className="rounded float-left"
              alt="Charlie Chaplin"
            ></img>{" "}
          </Col>
        </Row>
        <Row>
          <Col>Playing in</Col>
        </Row>
        <Row>
          <Col>Poker Tournament X </Col>
        </Row>
      </Card.Body>
    </Card>
    );
  }
}
