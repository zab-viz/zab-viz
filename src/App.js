import './App.css';
import Cluster from './components/Cluster';
import { FaComputer } from "react-icons/fa6";

function App() {
  return (
    <div className="App">
      <header className="App-title">
        <h1>ZAB Viz</h1>
        <p>A Visualization tool for Zookeeper Atomic Broadcast Protocol</p>
      </header>
      <Cluster />
      <div className="message-labels">
        <h4>LABELS</h4>
        <div className="message-label-list">
          <div className="message-list-item">
            <div className="message-point ask-vote message-visible-relative" ></div>
            <p><b>ASK VOTE</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point follower-info message-visible-relative"></div>
            <p><b>SEND FOLLOWER INFO</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point new-epoch message-visible-relative"></div>
            <p><b>NEW EPOCH</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point ack-epoch message-visible-relative"></div>
            <p><b>ACK EPOCH</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point new-leader message-visible-relative"></div>
            <p><b>NEW LEADER</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point ack-new-leader message-visible-relative"></div>
            <p><b>ACK NEW LEADER</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point heart-beat message-visible-relative"></div>
            <p><b>HEARTBEAT</b></p>
          </div>
          <div className="message-list-item">
            <div className="message-point client-message-forward message-visible-relative"></div>
            <p><b>MESSAGE FORWARDS</b></p>
          </div>
        </div>
      </div>
      <div className="client-machine" id="client-machine">
        <FaComputer fontSize={"3em"}/>
        <p><b>Client Machine</b></p>
        {/* <button onClick={() => {}}>Stop Messages</button> */}
      </div>
    </div>
  );
}

export default App;
