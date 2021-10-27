import React, { Component } from "react";

export default class Player extends Component {
  constructor(props){
    super(props);
    this.state = {showPopUp: false};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(
      {showPopUp: !this.state.showPopUp}
    );
  }

  render() {
    return(
      <div
      text = "Username
      Playing in Tournament X"
    
      onClick = {this.handleClick}

      />
    );
  }
}