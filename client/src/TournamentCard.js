import Card from "react-bootstrap/Card";
import {Row, Col, Container}  from "react-bootstrap";
import { Component } from "react";

export default class TournamentCard extends Component {
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
               {this.props.tournament[0]}
               </div>
           </Col>
           <Col md="auto"> </Col>
           </Row>
           <Row>
               <Col> Location</Col>
               </Row>
             <Row>
                 <Col>London, UK</Col>
                 </Row>  
        </Card.Body>
      </Card>   
    );
          
        }
      }