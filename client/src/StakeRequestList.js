import {Button, Card, Col, Row} from "react-bootstrap";
import React from "react";
import StakeRequestTile from "./StakeRequestTile";

export default function StakeRequestList({ requests, handleShowRequestDetails }) {
  if (!requests || requests.length === 0) {
    return "empty"
  } else {
    // return requests.filter(request => request.status === "0").map((request) =>
    //   <Card key={request.id} style={{backgroundColor:"#5f9ea0", width:"55rem", marginLeft:"auto", marginRight:"auto", marginBottom:"1rem", borderRadius:"10px", boxShadow: "5px 5px 2px grey"}}>
    //     <Card.Body>
    //       <Row>
    //         <Col>
    //           {request.horse}
    //         </Col>
    //         <Col>
    //           {request.amount}
    //         </Col>
    //         <Col>
    //           {request.profitShare}
    //         </Col>
    //         <Col xs={3}>
    //           <Button onClick={() => handleShowRequestDetails(request)} style={{backgroundColor:"#ff9800", borderColor:"grey", color:"black"}}>
    //             View More
    //           </Button>
    //         </Col>
    //       </Row>
    //     </Card.Body>
    //   </Card>)
    return requests.filter(request => request.status === "0").map((request) =>
      <StakeRequestTile request={request} onClick={() => handleShowRequestDetails(request)} />)
  }
}