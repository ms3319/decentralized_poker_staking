import Card from "react-bootstrap/Card";
import {Row, Col,Container}  from "react-bootstrap";
import { Component } from "react";

export default class PlayerCard extends Component {
      constructor(props){
        super(props);
      }
        render()  {
    return (
        <Card {...this.props} >
        <Card.Body>
       <Row>
           <Col>
           <div style={{fontSize: '20px', fontWeight:'bold'}}>
               {this.props.horse[1]}
               </div>
           </Col>
           <Col md="auto"> <img src="../charlie-chaplin-icon.png" class="rounded float-left" alt=".."></img> </Col>
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
