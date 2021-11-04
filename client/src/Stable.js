import React from 'react';
import PlayerCard from "./PlayerCard.js";
import {Container} from 'react-bootstrap';
import {useState} from 'react';
import './Stable.css';
import PlayerCardModalForm from './PlayerCardModalForm.js';

export default function Stable(props) {
        const [show, setShow] = useState(false);
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
       
        let investor = props.accounts[0];
        let investments = props.requests.filter(request => request.backer === investor);

        if(investments.length === 0) {
            return(
                <div>
                    <h1 align="center">
                        Stable is empty
                    </h1>
                    <h3 align="center">
                        You have not staked any games
                    </h3>
                </div>

            );
        }

        return(
           <div className = "Stable" style = {{overflowY: 'scroll'}}>
               <Container style={{position: 'absolute', left: '170px', backgroundColor: "white"}} fluid={true}>
               {
                        investments.map((stake, i) => (
                            <button onClick={handleShow} style={{padding: 0, border:'none', background: 'none'}}>
                                   <PlayerCard horse={stake.horse}
                                   bg={stake[0].toLowerCase()}
                                   key={i}
                                   text={stake[0] ==='Dark' ? 'light' :'dark'}
                                   style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                                   className="mb-2"/> 
                                </button>
                        )

                        ) }
                   </Container> 
                   <PlayerCardModalForm show={show} style={{position:'absolute', left:'170px'}} handleClose={handleClose}/>

           </div>             
        );
    
}