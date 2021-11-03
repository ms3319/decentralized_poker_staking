import { useWeb3React } from "@web3-react/core"
import styles from "./ConnectionStatus.module.css"
import { useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";
import { Link } from "react-router-dom";
import Button from "./Button";

export default function ConnectionStatus() {
  const { active, account, deactivate, chainId } = useWeb3React()
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  const handleClick = (event) => {
    setShow(!show);
  };

  return (
    <>
    <div ref={ref} className={styles.connectionStatus} onClick={handleClick}>
      <span className={styles.statusIndicator + (active ? (" " + styles.connected) : "")}></span>
      <span>{active ? "connected" : "Not connected"}</span>
    </div>

    <Overlay
      show={show}
      target={ref.current}
      placement="bottom"
      onHide={handleClick}
      rootClose
    >
      <Popover className={styles.popOverBody}>
        <Popover.Header as="h3">{active ? "Connected with " + account : "Not Connected"}</Popover.Header>
        <Popover.Body >
          {active ? (
            <span>
              <p>Chain ID: {chainId}</p>
              <Button onClick={deactivate}>Disconnect</Button>
            </span>
          ) : (
              <span>Navigate to the <Link className={styles.link} to={"/"}>homepage</Link> to connect your wallet to the app</span>
          )}
        </Popover.Body>
      </Popover>
    </Overlay>
    </>
  )
}