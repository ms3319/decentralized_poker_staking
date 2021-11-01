import React, { Component } from 'react';
import PlayerCard from "./PlayerCard.js";
import { Carousel} from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import './Stable.css';
const playersPerPage = 16;
const playersAndVariants =  [
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
        ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little']
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

export default class Stable extends Component {
    constructor(props) {
        super(props);
        // let playersAndVariants2 = playersAndVariants.concat(playersAndVariants);
        this.state = {players: playersAndVariants};
    }
    render(){
        let listsOfPlayersByPages = [];
        let startIndex = 0;
        let endIndex = playersPerPage;
        while(startIndex < this.state.players.length ) {
            listsOfPlayersByPages.push(this.state.players.slice(startIndex,endIndex));
            startIndex = endIndex;
            endIndex += playersPerPage;
        }
        return(
           <div className = "Stable"> 
                {/* <PlayerCard horses = {this.state.players}/> */}
             <Carousel>
                 <Container>
                 {
                     listsOfPlayersByPages.map((playersForThisPage) =>
                     (
                        <Carousel.Item>
                            <PlayerCard horses = {playersForThisPage}/>
                            </Carousel.Item> 
                     ))
                 }
                 </Container>
                 </Carousel>   
                
           </div>             
        );
    }
}