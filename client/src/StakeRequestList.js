import React from "react";
import StakeRequestTile from "./StakeRequestTile";

export default function StakeRequestList({ contract, requests, handleShowRequestDetails}) {
  if (!requests || requests.length === 0) {
    return null
  } else {
    return requests.map((request) => {
      return <StakeRequestTile contract={contract} key={request.id} request={request} handleShowRequestDetails={handleShowRequestDetails} />
    })
  }
}