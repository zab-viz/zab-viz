import React from "react";
import "./ServerStats.css";

export default class ServerStats extends React.Component {
  render() {
    const {acceptedEpoch, currentEpoch, history = [], lastZxid = 0} = this.props;
    return <div className="stats">
      {/* <p>State: {state}</p> */}
      <p>acceptedEpoch: {acceptedEpoch}</p>
      <p>currentEpoch: {currentEpoch}</p>
      <p>lastZxid: {lastZxid === -1 ? "NONE" : lastZxid}</p>
      <p>history: {history.length ? `[${history.join(", ")}]` : "EMPTY"}</p>
    </div>
  }
}