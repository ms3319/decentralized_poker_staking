import styles from './Button.module.css'

export default function Button({ children, onClick, icon, style }) {
  return (
    <button
      className={styles.safestakeButton}
      onClick={onClick ? onClick : () => {}}
      style={style}
    >
      {icon && <img src={icon} alt="button icon" className={children ? "" : styles.iconOnly} />}
      <span>{children}</span>
    </button>
  )
}