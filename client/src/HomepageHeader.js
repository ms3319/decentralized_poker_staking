import styles from './HomepageHeader.module.css';
import chips from './images/poker-chips.png'
import cards from './images/playing-cards.png'

export default function HomepageHeader() {
  return (
    <div className={styles.mainHeader}>
      <h1>SafeStake</h1>
      <img src={chips} alt="Poker Chips" className={styles.sideImg + " " + styles.chips} />
      <img src={cards} alt="Playing Cards" className={styles.sideImg + " " + styles.cards} />

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0,0 50,100 0,100"/>
        <polygon points="100,0 50,100 100,100"/>
      </svg>
    </div>
  )
}