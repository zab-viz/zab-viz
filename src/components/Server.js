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
        lastZxid: -1
      },
      name: props.name,
      electionTimer: 0,
    };
    this.MIN_TIME = 3000;
    this.MAX_TIME = 6000;
    this.followerInfos = [];
    this.ackEpochs = [];
    this.followerInfoCnt = 0;
    this.newLeaderAckCnt = 0;
    this.startTimer = this.startTimer.bind(this);
    this.askVote = this.askVote.bind(this);
    this.giveVote = this.giveVote.bind(this);
    this.followerInfo = this.followerInfo.bind(this);
    this.newEpoch = this.newEpoch.bind(this);
    this.getMessagePoint = this.getMessagePoint.bind(this);
    this.ackEpoch = this.ackEpoch.bind(this);
    this.newLeader = this.newLeader.bind(this);
    this.ackNewLeader = this.ackNewLeader.bind(this);
    this.receiveClientMessage = this.receiveClientMessage.bind(this);
    this.sendHeartBeats = this.sendHeartBeats.bind(this);
    this.receiveClientMessageLeader = this.receiveClientMessageLeader.bind(this);
    this.heartBeat = this.heartBeat.bind(this);
  }

  getMessagePoint = () => {
    const messageBox = document.getElementById("message-box");
    const messagePoint = document.createElement("div");
    messagePoint.className = `message-point ${this.state.name}-message-point`;
    messagePoint.style.visibility = "visible";
    messageBox.appendChild(messagePoint);
    return messagePoint;
  }

  askVote = () => {
    const { name } = this.state;
    const { serverRefs } = this.props;
    // set nested stats in state
    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        state: "LEADING",
      }
    }));
    this.props.changeClusterState("DISCOVERY");

    Object.keys(serverRefs).forEach(serverName => {
      if (serverName !== name) {
        clearInterval(serverRefs[serverName].timerRef);
        // add div to message box

        const messagePoint = this.getMessagePoint();
        // add another class to messagePoint
        messagePoint.className += " ask-vote";
        messagePoint.id = `${name}-${serverName}-ask-vote`;
        setTimeout(() => {
          messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[serverName].top;
          messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[serverName].left;
        }, 500);
        setTimeout(() => {
          serverRefs[serverName].giveVote(name);
        }, 2500);
        setTimeout(() => {
          const msg = document.getElementById(`${name}-${serverName}-ask-vote`);
          msg.parentNode.removeChild(msg);
        }, 4000);
      }
    });
  }

  giveVote = (askingServer) => {
    clearInterval(this.timerRef);
    // delete the message node from message box
    const { name, stats } = this.state;
    // send follower info to asking server
    const { serverRefs } = this.props;
    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        state: "FOLLOWING"
      }
    }));

    let messagePoint;
    setTimeout(() => {
      messagePoint = this.getMessagePoint();
      messagePoint.className += " follower-info";
      messagePoint.id = `${name}-${askingServer}-follower-info`;
    }, 200);
    setTimeout(() => {
      messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[askingServer].top;
      messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[askingServer].left;
    }, 2000);
    setTimeout(() => {
      serverRefs[askingServer].followerInfo(name, stats.currentEpoch);
    }, 4000);
    setTimeout(() => {
      const msg = document.getElementById(`${name}-${askingServer}-follower-info`);
      msg.parentNode.removeChild(msg);
    }, 6000);
  }

  followerInfo = (followerName, incomingEpoch) => {
    this.followerInfoCnt++;
    this.followerInfos.push({ followerName, incomingEpoch });
    if (this.followerInfoCnt === 4) {
      const maxEpoch = Math.max(...this.followerInfos.map(info => info.incomingEpoch), this.state.stats.currentEpoch);
      this.setState(prevState => ({
        stats: {
          ...prevState.stats,
          acceptedEpoch: maxEpoch + 1,
          currentEpoch: maxEpoch + 1,
        }
      }));
      this.followerInfoCnt = 0;
      // send newEpoch to all servers
      const { serverRefs } = this.props;
      const { name } = this.state;
      Object.keys(serverRefs).forEach(serverName => {
        if (serverName !== name) {
          // clearInterval(serverRefs[serverName].timerRef);
          // add div to message box
          const messagePoint = this.getMessagePoint();
          messagePoint.className += " new-epoch";
          messagePoint.id = `${name}-${serverName}-new-epoch`;
          setTimeout(() => {
            messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[serverName].top;
            messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[serverName].left;
          }, 500);
          setTimeout(() => {
            serverRefs[serverName].newEpoch(name, maxEpoch + 1);
          }, 2500);
          setTimeout(() => {
            const msg = document.getElementById(`${name}-${serverName}-new-epoch`);
            msg.parentNode.removeChild(msg);
          }, 4000);
        }
      });
    }
  }

  newEpoch = (leaderName, newEpoch) => {
    // get name from state and acceptedEpoch from state.stats
    const { name, stats } = this.state;
    const { acceptedEpoch } = stats;
    const { serverRefs } = this.props;
    if (newEpoch > acceptedEpoch) {
      this.setState(prevState => ({
        stats: {
          ...prevState.stats,
          acceptedEpoch: newEpoch,
        }
      }));
      // 
      const messagePoint = this.getMessagePoint();
      messagePoint.className += " ack-epoch";
      messagePoint.id = `${name}-${leaderName}-ack-epoch`;
      setTimeout(() => {
        messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[leaderName].top;
        messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[leaderName].left;
      }, 500);
      setTimeout(() => {
        serverRefs[leaderName].ackEpoch(name, stats.currentEpoch, stats.history, stats.lastZxid);
      }, 2500);
      setTimeout(() => {
        const msg = document.getElementById(`${name}-${leaderName}-ack-epoch`);
        msg.parentNode.removeChild(msg);
      }, 4000);
    }
  }

  ackEpoch = (followerName, currentEpoch, history, lastZxid) => {

    this.ackEpochs.push({ followerName, currentEpoch, history, lastZxid });
    if (this.ackEpochs.length === 4) {
      // add self
      this.ackEpochs.unshift({ followerName: this.state.name, currentEpoch: this.state.stats.currentEpoch, history: this.state.stats.history, lastZxid: this.state.stats.lastZxid });
      let _follower;
      for (let i in this.ackEpochs) {
        const follower = this.ackEpochs[i];
        for (let j in this.ackEpochs) {
          if (i === j) continue;
          const other = this.ackEpochs[j];
          if ((other.currentEpoch < follower.currentEpoch) || ((other.currentEpoch === follower.currentEpoch) ^ (other.lastZxid < follower.lastZxid))) {
            _follower = follower;
            break;
          }
        }
        if (_follower) break;
      };
      // adopt the history of that leader
      this.setState(prevState => ({
        stats: {
          ...prevState.stats,
          history: _follower.history
        }
      }));
      // send New Leader message to all followers
      const { serverRefs } = this.props;
      const { name } = this.state;
      Object.keys(serverRefs).forEach(serverName => {
        if (serverName !== name) {
          // clearInterval(serverRefs[serverName].timerRef);
          // add div to message box
          const messagePoint = this.getMessagePoint();
          messagePoint.className += " new-leader";
          messagePoint.id = `${name}-${serverName}-new-leader`;
          setTimeout(() => {
            messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[serverName].top;
            messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[serverName].left;
          }, 500);
          setTimeout(() => {
            serverRefs[serverName].newLeader(name, _follower.currentEpoch, _follower.history);
          }, 2500);
          setTimeout(() => {
            const msg = document.getElementById(`${name}-${serverName}-new-leader`);
            msg.parentNode.removeChild(msg);
          }, 4000);
        }
      });
      this.props.changeClusterState("SYNCHRONIZATION");
    }
  }

  newLeader = (leaderName, leaderEpoch, leaderHistory) => {
    const { stats } = this.state;
    if (leaderEpoch === stats.acceptedEpoch) {
      this.setState(prevState => ({
        stats: {
          ...prevState.stats,
          currentEpoch: leaderEpoch,
        }
      }));
      const myhistoryLastIndex = stats.history.length - 1;
      const pendingHistory = [];
      for (let i = myhistoryLastIndex + 1; i < leaderHistory.length; i++) {
        pendingHistory.push(leaderHistory[i]);
      }
      this.setState(prevState => ({
        stats: {
          ...prevState.stats,
          history: [...prevState.stats.history, ...pendingHistory]
        }
      }));
      // send ack new leader to leader
      const { serverRefs } = this.props;
      const { name } = this.state;
      const messagePoint = this.getMessagePoint();
      messagePoint.className += " ack-new-leader";
      messagePoint.id = `${name}-${leaderName}-ack-new-leader`;
      setTimeout(() => {
        messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[leaderName].top;
        messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[leaderName].left;
      }, 500);
      setTimeout(() => {
        serverRefs[leaderName].ackNewLeader(name);
      }, 2000);
      setTimeout(() => {
        const msg = document.getElementById(`${name}-${leaderName}-ack-new-leader`);
        msg.parentNode.removeChild(msg);
      }, 4000);
    }
  }

  ackNewLeader = (followerName) => {
    this.newLeaderAckCnt++;
    if (this.newLeaderAckCnt === 4) {
      this.props.changeClusterState("BROADCAST", this.state.name);
      this.sendHeartBeats();
      this.newLeaderAckCnt = 0;
    }
  }

  receiveClientMessage = (num, type = "W") => {
    if (type === "R") {
      const { name } = this.state;
      const messagePoint = this.getMessagePoint();
      messagePoint.className += ` ${this.state.name}-message-point client-message-forward`;
      messagePoint.id = `${name}-response-client-message`;
      setTimeout(() => {
        messagePoint.style.top = this.props.CLIENT_MACHINE_POINTS.top;
        messagePoint.style.left = 95 - (this.props.CLIENT_MACHINE_POINTS.right).split("%")[0] + "%";
        messagePoint.style.right = this.props.CLIENT_MACHINE_POINTS.right;
      }, 500);
      // setTimeout(() => {
      //   serverRefs[randomServer].receiveClientMessageLeader(null);
      // }, 2500);
      setTimeout(() => {
        const msg = document.getElementById(`${name}-response-client-message`);
        msg.parentNode.removeChild(msg);
      }, 4000);
      return;
    }
    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        // lastZxid: prevState.stats.lastZxid + 1,
        history: [...prevState.stats.history, num]
      }
    }));
    // forward to everyone
    const { serverRefs } = this.props;
    const { name } = this.state;
    Object.keys(serverRefs).forEach(serverName => {
      if (serverName !== name) {
        const messagePoint = this.getMessagePoint();
        messagePoint.className += " client-message-forward";
        messagePoint.id = `${name}-${serverName}-client-message`;
        setTimeout(() => {
          messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[serverName].top;
          messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[serverName].left;
        }, 500);
        setTimeout(() => {
          serverRefs[serverName].receiveClientMessageLeader(num);
        }, 2500);
        setTimeout(() => {
          const msg = document.getElementById(`${name}-${serverName}-client-message`);
          msg.parentNode.removeChild(msg);
        }, 4000);
      }
    });
  }

  receiveClientMessageLeader = (num) => {
    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        // lastZxid: prevState.stats.lastZxid + 1,
        history: [...prevState.stats.history, num]
      }
    }));
  }

  startTimer = () => {
    this.timerRef = setInterval(this.timerFn, 1000)
    this.timerFn = timerFn.bind(this);
    function timerFn() {
      const {electionTimer} = this.state;
      if (electionTimer <= 0) return;
      if (electionTimer <= 100) {
        clearInterval(this.timerRef);
        this.askVote();
      }
      this.setState(prevState => ({ electionTimer: prevState.electionTimer - 100 }));
    }
  }

  sendHeartBeats = () => {
    this.heartBeatsFn = hbFn.bind(this);

    function hbFn() {
      const { serverRefs } = this.props;
      const { name, stats } = this.state;
      Object.keys(serverRefs).forEach(serverName => {
        if (serverName !== name) {
          const messagePoint = this.getMessagePoint();
          messagePoint.className += " heart-beat";
          messagePoint.id = `${name}-${serverName}-heart-beat`;
          setTimeout(() => {
            messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[serverName].top;
            messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[serverName].left;
          }, 500);
          setTimeout(() => {
            serverRefs[serverName].heartBeat(name, stats.currentEpoch, stats.history, stats.lastZxid);
          }, 2500);
          setTimeout(() => {
            const msg = document.getElementById(`${name}-${serverName}-heart-beat`);
            msg.parentNode?.removeChild(msg);
          }, 4000);
        }
      });
    }
    setInterval(this.heartBeatsFn, 1000);
  }

  heartBeat = () => {
    this.setState({ electionTimer: this.MAX_TIME })
    setTimeout(() => {
      this.startTimer();
    }, 200);
  }

  componentDidMount() {
    const { MIN_TIME, MAX_TIME } = this;
    // get random time between 3 and 6 seconds
    const randomTime = Math.floor(Math.random() * (MAX_TIME - MIN_TIME + 1) + MIN_TIME);
    // const percentTimer = randomTime / MAX_TIME * 100;
    this.setState({ electionTimer: randomTime });
    setTimeout(() => {
      this.startTimer();
    }, 200);
  }

  render() {
    const { stats, name, electionTimer } = this.state;
    const { MAX_TIME } = this;
    return (
      <div className="server">
        <div className="server-name-state">
          <h3 className={`server-name ${this.state.stats.state === "LEADING" ? "leader-server-name" : ""}`}>{this.props.name}</h3>
          <p>{stats.state}</p>
          <div className={`countDownTimer`} style={{ width: `${electionTimer / MAX_TIME * 100}%` }} ></div>
        </div>
        <div className={`server-stats-${name}`}>
          <ServerStats {...stats} />
        </div>
      </div>
    );
  }
}