import './Cluster.css';
import React from 'react';
import Server from './Server';

export default class Cluster extends React.Component {
  constructor(props) {
    super();
    this.state = {clusterState: "ELECTION"}
    this.serverRefs = {};
    this.setInstance = this.setInstance.bind(this);
    this.setAnotherServerState = this.setAnotherServerState.bind(this);
  }

  setInstance = (instance, name) => {
    this.serverRefs[name] = instance;
  }

  setAnotherServerState(server, state) {
    server.setServerStatus(state);
  }

  render() {
    const updateStates = {};
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
          <div className="message" id="test-message"></div>
        </div>
      </div>
    )
  };
}