import React, {useEffect, useState} from 'react';
import TournamentCard from "./TournamentCard"
import {Container} from 'react-bootstrap';
import {useHistory} from "react-router-dom";
import styles from "./MyGames.module.css"

const tournamentsPerPage = 16;
const tournamentsAndVariants =  [
    ['Primary', 'Masters of Poker'],
    ['Secondary', 'UK Open Poker'],
    ['Success','Texas Holdem Champions'],
    ['Danger]','Omaha Champions League'],
    ['Warning','High Low Chicago Conference League'],
    ['Info','Badugi National League'],
    ['Light','Bluff or Nuff Cup'],
    ['Dark','Beginners International Knockouts']
  ];

const variants = [
    'Primary',
    'Secondary',
    'Success',
    'Danger',
    'Warning',
    'Info',
    'Light',
    'Dark'
];

export default function MyGames({ contract, accounts }) {
    const [player, setPlayer] = useState(null)
    const history = useHistory()

    useEffect(() => {
        if (contract != null) {
            contract.methods.getPlayer(accounts[0]).call().then((player) => {setPlayer(player)})
        }
    }, [contract])

    if (contract == null || player == null) return null

    const isRegisteredPlayer = !(player.playerAddress === "0x0000000000000000000000000000000000000000")
    
    return(
       <div className={styles.myGames}>
           <h1>{isRegisteredPlayer ? "My Games" : "You have not registered a player account"}</h1>
           <Container style={{position: 'absolute', left: '170px', backgroundColor: "white"}} fluid = {true}>
           {
                    tournamentsAndVariants.map((tournament,idx) => (
                        
                               <TournamentCard tournament={tournament}
                               bg={tournament[0].toLowerCase()}
                               key={idx}
                               text={tournament[0] ==='Dark' ? 'light' :'dark'}
                               style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                               className="mb-2"/> 
                            
                    )

                    ) }
               </Container> 
               

       </div>             
    );

}