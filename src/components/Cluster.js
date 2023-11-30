import './Cluster.css';
import React from 'react';
import Server from './Server';


const SERVER_MESSAGE_POINTS = {
  S1: { top: "5%", left: "47%" },
  S2: { top: "35%", left: "8%" },
  S3: { top: "75%", left: "16%" },
  S4: { top: "75%", left: "78%" },
  S5: { top: "35%", left: "88%" }
}

export default class Cluster extends React.Component {
  constructor(props) {
    super();
    this.state = { clusterState: "ELECTION" }
    this.serverRefs = {};
    this.setInstance = this.setInstance.bind(this);
    this.changeClusterState = this.changeClusterState.bind(this);
  }

  setInstance = (instance, name) => {
    this.serverRefs[name] = instance;
  }

  changeClusterState = (clusterState) => {
    this.setState({ clusterState });
  }

  render() {
    const updateStates = { serverRefs: this.serverRefs, SERVER_MESSAGE_POINTS, changeClusterState: this.changeClusterState };
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
            {/* <div className="message-point s1-message-point" id=""></div>
            <div className="message-point s2-message-point" id=""></div>
            <div className="message-point s3-message-point" id=""></div>
            <div className="message-point s4-message-point" id=""></div>
            <div className="message-point s5-message-point" id=""></div> */}
          </div>
        </div>
      </div>
    )
  };
}