import React from "react";
import StakeRequestTile from "./StakeRequestTile";
import { StakeStatus } from "./utils"

export default function StakeRequestList({ contract, requests, handleShowRequestDetails}) {
  if (!requests || requests.length === 0) {
    return null
  } else {
    return requests.filter(request => request.status === StakeStatus.Requested).map((request) => {
      return <StakeRequestTile contract={contract} key={request.id} request={request} handleShowRequestDetails={handleShowRequestDetails} />
    })
  }
}