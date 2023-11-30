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
      name: props.name,
      electionTimer: 0,
      MIN_TIME: 2000,
      MAX_TIME: 4000
    };
    this.followerInfos = [];
    this.followerInfoCnt = 0;
    this.startTimer = this.startTimer.bind(this);
    this.askVote = this.askVote.bind(this);
    this.giveVote = this.giveVote.bind(this);
    this.followerInfo = this.followerInfo.bind(this);
    this.newEpoch = this.newEpoch.bind(this);
    this.getMessagePoint = this.getMessagePoint.bind(this);
    this.ackEpoch = this.ackEpoch.bind(this);
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
    console.log("ASKING FOR VOTE", this.state.name);
    const { name } = this.state;
    const { serverRefs } = this.props;
    const currentEpoch = this.state.stats.currentEpoch + 1;
    // set nested stats in state
    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        // acceptedEpoch: currentEpoch,
        // currentEpoch,
        state: "LEADING"
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
          serverRefs[serverName].giveVote(name, currentEpoch);
        }, 2500);
        setTimeout(() => {
          const msg = document.getElementById(`${name}-${serverName}-ask-vote`);
          msg.parentNode.removeChild(msg);
        }, 4000);
      }
    });
  }

  giveVote = (askingServer, incomingEpoch) => {
    console.log(`I AM ${this.state.name} AND ${askingServer} IS ASKING FOR VOTE`);
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
      console.log("SENDING FOLLOWER INFO TO ", askingServer);
      messagePoint = this.getMessagePoint();
      messagePoint.className += " follower-info";
      messagePoint.id = `${name}-${askingServer}-follower-info`;
    }, 2000);
    setTimeout(() => {
      messagePoint.style.top = this.props.SERVER_MESSAGE_POINTS[askingServer].top;
      messagePoint.style.left = this.props.SERVER_MESSAGE_POINTS[askingServer].left;
    }, 4000);
    setTimeout(() => {
      serverRefs[askingServer].followerInfo(name, stats.currentEpoch);
    }, 6000);
    setTimeout(() => {
      const msg = document.getElementById(`${name}-${askingServer}-follower-info`);
      msg.parentNode.removeChild(msg);
    }, 8000);
  }

  followerInfo = (followerName, incomingEpoch) => {
    this.followerInfoCnt++;
    this.followerInfos.push({followerName, incomingEpoch});
    if (this.followerInfoCnt == 4) {
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
    const {name, stats} = this.state;
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
    console.log("Got ack epoch from", followerName);
  }

  startTimer = () => {
    this.timerRef = setInterval(this.timerFn, 200)
    this.timerFn = timerFn.bind(this);
    function timerFn() {
      if (this.state.electionTimer <= 0) return;
      if (this.state.electionTimer <= 100) {
        console.log("ELECTION TIMER IS DONE FOR ", this.state.name, this.state.electionTimer);
        clearInterval(this.timerRef);
        this.askVote();
      }
      this.setState(prevState => ({ electionTimer: prevState.electionTimer - 100 }));
    }
  }

  componentDidMount() {
    document.getElementById("message-box").innerHTML = "";
    const { MIN_TIME, MAX_TIME } = this.state;
    // get random time between 3 and 6 seconds
    const randomTime = Math.floor(Math.random() * (MAX_TIME - MIN_TIME + 1) + MIN_TIME);
    // const percentTimer = randomTime / MAX_TIME * 100;
    this.setState({ electionTimer: randomTime });
    setTimeout(() => {
      this.startTimer();
    }, 200);
  }

  render() {
    const { stats, name, electionTimer, MAX_TIME } = this.state;
    return (
      <div className="server">
        <div className="server-name-state">
          <h3 className="server-name">{this.props.name}</h3>
          <p>{stats.state}</p>
          <div className={`countDownTimer`} style={{ width: `${electionTimer / MAX_TIME * 100}%` }} ></div>
        </div>
        <div className={`server-stats-${name}`}>
          <ServerStats {...stats} />
        </div>
        {/* <div className={`message-point ${name}-message-point`}></div> */}
      </div>
    );
  }
}