import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Table } from "react-bootstrap";
import buttonStyles from './Button.module.css'
import {dateFromTimeStamp, numberWithCommas, units} from "./utils";

const MutiStakeSummary = ({ requests, onHide, show, playerName, tokenContract, contract, backerAccount, reloadContractState}) => {
    // requests is an array of [requestName, request obj] pairs
    const [amounts, setAmounts] = useState(requests.map(_ => 0));
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        setAmounts(requests.map(_ => 0));
    }, [requests]);

    const checkAmounts = () => {
        let i = 0;
        while (i < requests.length) {
            if (amounts[i] <= 0 || amounts[i] * 1e18 > requests[i][1].amount - requests[i][1].investmentDetails.filledAmount) {
                setConfirmEnabled(false);
                return;
            }
            i++;
        }
        setConfirmEnabled(true);
    }

    const fillMultiStakes = async () => {
        const convertToAmountString = (val) => {
            return "0x" + val.toString(16);
        }

        const totalAmountString = convertToAmountString(totalAmount * 1e18);
        const requestIDs = requests.map(r => r[1].id);
        const amountStrings = amounts.map(amount => convertToAmountString(amount * 1e18));

        await tokenContract.methods.approve(contract.options.address, totalAmountString).send({from: backerAccount});
        await contract.methods.stakeMultipleGamesOnHorse(requestIDs, amountStrings).send({ from: backerAccount })
            .then(() => {reloadContractState(); onHide();})
    }

    const handleAmountChange = (value, index) => {
        const amountsCopy = amounts;
        amountsCopy[index] = value === "" ? 0 : parseInt(value);
        setAmounts(amountsCopy);
        checkAmounts();
        setTotalAmount(amounts.reduce((a, b) => a + b, 0));
    }

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
                        <th>Remaining</th>
                        <th>Escrow</th>
                        <th>Profit Share</th>
                        <th>Your Investment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            requests.map((request, i) => (
                                <tr key={i}>
                                <td>{request[0]}</td>
                                <td>{dateFromTimeStamp(parseInt(request[1].stakeTimeStamp.scheduledForTimestamp)).toLocaleDateString()}</td>
                                <td>{`${numberWithCommas(units(request[1].amount))}◈`}</td>
                                <td>{`${numberWithCommas(units(request[1].amount) - units(request[1].investmentDetails.filledAmount))}◈`}</td>
                                <td>{`${numberWithCommas(units(request[1].escrow))}◈`}</td>
                                <td>{`${request[1].profitShare}%`}</td>
                                <td><input onChange={(event) => handleAmountChange(event.target.value, i)}></input></td>
                                </tr>
                            ))
                        }                        
                    </tbody>
                </Table>

                {!confirmEnabled && <div style={{color: "red"}}>Please ensure you have entered an amount for all stakes that is less than the remaining amount requested.</div>}
                
                <h5>You'll be investing a total of {amounts.reduce((a, b) => a + b, 0)}◈ in {playerName} across {requests.length} event(s).</h5>
                <br></br>
                <center>
                    <button className={confirmEnabled ? buttonStyles.safestakeButton : buttonStyles.disabledSafestakeButton} onClick={fillMultiStakes}>Confirm</button>
                </center>      
            </Modal.Body>
        </Modal>
    );
}

export default MutiStakeSummary;