import React from "react";
import StakeRequestTile from "./StakeRequestTile";

export default function StakeRequestList({ requests, handleShowRequestDetails }) {
  if (!requests || requests.length === 0) {
    return null
  } else {
    return requests.filter(request => request.status === "0").map((request) =>
      <StakeRequestTile request={request} onClick={() => handleShowRequestDetails(request)} />)
  }
}