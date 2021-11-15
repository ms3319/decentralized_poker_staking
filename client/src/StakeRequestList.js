import React from "react";
import StakeRequestTile from "./StakeRequestTile";

export default function StakeRequestList({ contract, requests, handleShowRequestDetails, ethPriceUsd}) {
  if (!requests || requests.length === 0) {
    console.log(requests);
    return null
  } else {
    return requests.filter(request => request.status === "0").map((request) =>
      <StakeRequestTile ethPriceUsd={ethPriceUsd} contract={contract} key={request.id} request={request} onClick={() => handleShowRequestDetails(request)} />)
  }
}