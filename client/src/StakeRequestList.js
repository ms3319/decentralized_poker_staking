import React, {useEffect, useState} from "react";
import StakeRequestTile from "./StakeRequestTile";
import { CoinGeckoClient } from "./utils";

export default function StakeRequestList({ contract, requests, handleShowRequestDetails }) {
  const [ethPriceUsd, setEthPriceUsd] = useState(0);

  useEffect(() => {
    CoinGeckoClient.simple.price({ids: ['ethereum'], vs_currencies: ['usd']}).then(resp => setEthPriceUsd(resp.data.ethereum.usd));
  }, [])

  if (!requests || requests.length === 0) {
    return null
  } else {
    return requests.filter(request => request.status === "0").map((request) =>
      <StakeRequestTile ethPriceUsd={ethPriceUsd} contract={contract} key={request.id} request={request} onClick={() => handleShowRequestDetails(request)} />)
  }
}