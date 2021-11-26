import React from "react";
import StakeRequestTile from "./StakeRequestTile";

export default function StakeRequestList({ contract, requests, handleShowRequestDetails}) {
  if (!requests || requests.length === 0) {
    return null
  } else {
    return requests.filter(request => request.status === "0").map((request) =>
      <StakeRequestTile contract={contract} key={request.id} request={request} onClick={() => handleShowRequestDetails(request)} />)
  }
}