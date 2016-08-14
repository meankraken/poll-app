var setPolls;


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            polls: []  
        };
    }
    
    
    componentDidMount() {
        $.ajax({
            url: window.location.href + "getPolls",
            dataType:"json",
            type: 'GET',
            error: function(err) {
                console.log("Error getting json data.");
            },
            success: function(polls) {
                this.setState({ polls: polls })
                
            }.bind(this)
            
        });
    }
    
    render() {
        if (this.state.polls.length==0) {
            return <div>Standby for polls.</div>;
        }
        else {
            console.log(this.state.polls);
            return (
                <div>
                {this.state.polls.map(function(item) {
                   return <Poll question={item.question} creator={item.creator} id={item._id} />;
                     
                })}
                </div>
                );
        }
    }
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
    }
    
    redi() {
        window.location = "/poll/" + this.props.id;
    }
    
    render() {
        return (
            <div onClick={this.redi.bind(this)} id={this.props.id} key={this.props.id} className="poll">
                <span className="pollQuestion">{this.props.question}</span>
                <span className="pollCreator">{this.props.creator}</span>
            </div>
            );
    }
}

ReactDOM.render(<App/>, document.querySelector(".pollList"));

