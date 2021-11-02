import styles from './StakeRequestTile.module.css'
import rightArrow from './images/arrow-right.svg'

const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const ethereumUnits = (amountInWei) => {
  if (amountInWei < 1e9) {
    return { units: "wei", amount: amountInWei};
  } else if (1e9 <= amountInWei && amountInWei < 1e18) {
    return { units: "Gwei", amount: +(amountInWei / 1e9).toFixed(2)};
  } else {
    return { units: "Eth", amount: +(amountInWei / 1e18).toFixed(2)};
  }
}

export default function StakeRequestTile({ request, onClick }) {
  let escrow = ethereumUnits(/*request.escrow*/999999999);
  let stake = ethereumUnits(request.amount);
  return (
    <div className={styles.stakeRequestTile} onClick={onClick}>
      <div className={styles.user}>
        <span className={styles.label}>User</span>
        <span className={styles.value}>{/*Should be getUserName(request.horse)*/"razzle_dazzle43"}</span>
      </div>
      <div>
        <span className={styles.label}>Escrow ({escrow.units})</span>
        <span className={styles.value}>{/*Should be request.escrow*/numberWithCommas(escrow.amount)}</span>
      </div>
      <div>
        <span className={styles.label}>Stake ({stake.units})</span>
        <span className={styles.value}>{numberWithCommas(stake.amount)}</span>
      </div>
      <div>
        <span className={styles.label}>Profit Share (%)</span>
        <span className={styles.value}>{request.profitShare}</span>
      </div>
      <img className={styles.details} src={rightArrow} />
    </div>
  )
}