import './Cluster.css';
import React from 'react';
import Server from './Server';


const SERVER_MESSAGE_POINTS = {
  S1: { top: "5%", left: "47%", right: "48%" },
  S2: { top: "35%", left: "8%" },
  S3: { top: "75%", left: "16%" },
  S4: { top: "75%", left: "78%" },
  S5: { top: "35%", left: "88%" }
}

const CLIENT_MACHINE_POINTS = {
  top: "-11%",
  right: "-65%"
}

export default class Cluster extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clusterState: "ELECTION", hideHeartbeats: false }
    this.serverRefs = {};
    this.setInstance = this.setInstance.bind(this);
    this.changeClusterState = this.changeClusterState.bind(this);
    this.stopHeartbeats = this.stopHeartbeats.bind(this);
    this.startServerTimers = this.startServerTimers.bind(this);
  }

  setInstance = (instance, name) => {
    this.serverRefs[name] = instance;
  }

  getClientMessagePoint = () => {
    const messageBox = document.getElementById("message-box");
    const messagePoint = document.createElement("div");
    messagePoint.className = `message-point client-machine-point`;
    messagePoint.style.visibility = "visible";
    messageBox.appendChild(messagePoint);
    return messagePoint;
  }

  changeClusterState = (clusterState, leaderName = "") => {
    if (clusterState === "BROADCAST") {
      setTimeout(() => {
        const clientMachine = document.getElementById("client-machine");
        clientMachine.style.visibility = "visible";

        this.streamMsgs = streamMsgs.bind(this);
        function streamMsgs() {
          const clientPoint = this.getClientMessagePoint();
          setTimeout(() => {
            clientPoint.style.top = SERVER_MESSAGE_POINTS[leaderName].top;
            clientPoint.style.right = 95 - (SERVER_MESSAGE_POINTS[leaderName].left).split("%")[0] + "%";
            // send random number to leader between 0 and 100
            setTimeout(() => {
              const randomNum = Math.floor(Math.random() * 100);
              this.serverRefs[leaderName].receiveClientMessage(randomNum);
            }, 3000);
          }, 500);
          setTimeout(() => {
            clientPoint.parentNode.removeChild(clientPoint);
          }, 5000);
        }

        const startButton = document.createElement("button");
        startButton.innerHTML = "Start Messages";

        const stopButton = document.createElement("button");
        stopButton.innerHTML = "Stop Messages";

        const randomReadButton = document.createElement("button");
        randomReadButton.innerHTML = "Random Read";

        randomReadButton.onclick = () => {
          // choose random server to read from without leader
          const followers = Object.keys(SERVER_MESSAGE_POINTS).filter(name => name !== leaderName);
          const randomServer = followers[Math.floor(Math.random() * followers.length)];

          const randomReadPoint = this.getClientMessagePoint();
          setTimeout(() => {
            randomReadPoint.style.top = SERVER_MESSAGE_POINTS[randomServer].top;
            randomReadPoint.style.right = 95 - (SERVER_MESSAGE_POINTS[randomServer].left).split("%")[0] + "%";
            // send random number to leader between 0 and 100
            setTimeout(() => {
              this.serverRefs[randomServer].receiveClientMessage(null, "R");
            }, 3000);
            setInterval(() => {
              randomReadPoint.parentNode?.removeChild(randomReadPoint);
            }, 6000);
          }, 500);

          // clientMachine.removeChild(randomReadButton);
        }

        startButton.onclick = () => {
          this.cliMsgIntRef = setInterval(this.streamMsgs, 7000);
          clientMachine.removeChild(startButton);
          clientMachine.appendChild(stopButton);
        }


        stopButton.onclick = () => {
          clearInterval(this.cliMsgIntRef);
          clientMachine.removeChild(stopButton);
          clientMachine.appendChild(startButton);
          clientMachine.appendChild(randomReadButton);
        }

        clientMachine.appendChild(stopButton);

        this.cliMsgIntRef = setInterval(this.streamMsgs, 7000);
      }, 2500);
    }
    this.setState({ clusterState, leaderName });
  }

  stopHeartbeats = () => {
    this.setState({ hideHeartbeats: true })
    Object.keys(this.serverRefs).forEach(serverName => {
      this.serverRefs[serverName].stopHeartbeat();
    });
  }
  showHeartbeats = () => {
    this.setState({ hideHeartbeats: false })
    Object.keys(this.serverRefs).forEach(serverName => {
      this.serverRefs[serverName].stopHeartbeat(false);
    });
  }

  startServerTimers = () => {
    Object.keys(this.serverRefs).forEach(serverName => {
      this.serverRefs[serverName].startTimer();
    });
  }

  render() {
    const updateStates = { serverRefs: this.serverRefs, SERVER_MESSAGE_POINTS, changeClusterState: this.changeClusterState, CLIENT_MACHINE_POINTS };
    const { clusterState } = this.state;
    return (
      <div className='cluster'>
        <h2>CLUSTER STATE: {clusterState}</h2>
        <div className='cluster-setup'>
          <div className="server-1">
            <Server name="S1" statsPosition="right" ref={instance => this.setInstance(instance, "S1")} {...updateStates} />
          </div>
          <div className="server-2">
            <Server name="S2" statsPosition="right" ref={instance => this.setInstance(instance, "S2")} {...updateStates} />
          </div>
          <div className="server-5">
            <Server name="S5" statsPosition="right" ref={instance => this.setInstance(instance, "S5")} {...updateStates} />
          </div>
          <div className="server-3">
            <Server name="S3" statsPosition="right" ref={instance => this.setInstance(instance, "S3")} {...updateStates} />
          </div>
          <div className="server-4">
            <Server name="S4" statsPosition="right" ref={instance => this.setInstance(instance, "S4")} {...updateStates} />
          </div>
          <div id="message-box">
          </div>
        </div>
        <div className="setting-buttons">
          <button onClick={() => this.startServerTimers()}>Start Timer</button>
          <button onClick={() => this.state.hideHeartbeats ? this.showHeartbeats() : this.stopHeartbeats()}>{this.state.hideHeartbeats ? "Show" : "Hide"} HeartBeats</button>
        </div>
      </div>
    )
  };
}