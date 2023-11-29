import React from 'react';
import './Server.css';
import ServerStats from './ServerStats';

export default class Server extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        state: "ELECTION",
        acceptedEpoch: 0,
        currentEpoch: 0,
        history: [],
        lastZxid: 0
      },
      name: props.name
    };
    this.setServerStatus = this.setServerStatus.bind(this);
  }

  componentDidMount() {
    const { name } = this.state;
    if(name === "S1") {
      setTimeout(() => {
        const message = document.getElementById("test-message");
        message.style.top = "32%";
        message.style.left = "8%";
        
      }, 3000);
    }
  }

  setServerStatus(serverState) {
    this.setState({ stats: { ...this.state.stats, state: serverState } });
  }

  render() {
    const { stats, name } = this.state;
    console.log("Running server:", name);
    return (
      <div className="server">
        <div className="server-name-state">
          <h3 className="server-name">{this.props.name}</h3>
          <p>{stats.state}</p>
        </div>
        <div className={`server-stats-${name}`}>
          <ServerStats {...stats} />
        </div>
      </div>
    );
  }
}