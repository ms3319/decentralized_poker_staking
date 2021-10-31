import './ConnectionButton.css'

export default function ConnectionButton({ children, onClick, icon }) {
  return (
    <button
      className="connection-button"
      onClick={onClick ? onClick : () => {}}
    >
      {icon && <img src={icon} alt="button icon" />}
      <span>{children}</span>
    </button>
  )
}