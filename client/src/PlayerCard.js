import Card from "react-bootstrap/Card";
import {Row, Col, ListGroup}  from "react-bootstrap";

const PlayerCard = (props) => {
    return (
        <>
        <Card style={{ width: "22rem" }}>
                <Card.Body>
                    <Row classname = "rowsPlayerCard">
                        <Col classname = "columnsPlayerCard">
                            <Card.Text classname = "card-text">
                                <ListGroup>
                                    <ListGroup.Item disabled>Name: Daniel</ListGroup.Item>
                                    <ListGroup.Item disabled>Surname: Negreanu</ListGroup.Item>
                                    <ListGroup.Item disabled>
                                        Playing in the Tournament:\n
                                        WSOT - Las Vegas
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Text>
                        </Col>
                        <Col>
                            <img src="../playerprofile.png" class="rounded float-left" alt=".."></img>
                        </Col>
                    </Row>
                </Card.Body>
        </Card>
   
        </>
    );
  };
  
  export default PlayerCard;