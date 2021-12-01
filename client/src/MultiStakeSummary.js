import React from "react";
import { Modal } from "react-bootstrap";
import { Table } from "react-bootstrap";
import Button from "./Button"
import {dateFromTimeStamp, numberWithCommas, units} from "./utils";

const getTotalAmount = (requests) => {
    let amount = units(0);
    for (const request of requests) {
        amount += units(request[1].amount);
    }
    return amount;
  }

const MutiStakeSummary = ({ requests, onHide, show, playerName}) => {
    // requests is an array of [requestName, request obj] pairs

    return (
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    <h2>Invest in {requests.length} of {playerName}'s stake(s)</h2>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Stake</th>
                        <th>Escrow</th>
                        <th>Profit Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            requests.map(request => (
                                <tr>
                                <td>{request[0]}</td>
                                <td>{dateFromTimeStamp(parseInt(request[1].stakeTimeStamp.scheduledForTimestamp)).toLocaleDateString()}</td>
                                <td>{`${numberWithCommas(units(request[1].amount))}◈`}</td>
                                <td>{`${numberWithCommas(units(request[1].escrow))}◈`}</td>
                                <td>{`${request[1].profitShare}%`}</td>
                                </tr>
                            ))
                        }                        
                    </tbody>
                </Table>
                
                <h5>You'll be investing a total of {getTotalAmount(requests)}◈ in {playerName} across {requests.length} event(s).</h5>
                <br></br>
                <center>
                    <Button>Confirm</Button>
                </center>      
            </Modal.Body>
        </Modal>
    );
}

export default MutiStakeSummary;