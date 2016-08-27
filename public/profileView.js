$(document).ready(function() {
   $("#logoutBtn").on("click", function() {
       window.location = '/logout';
   }) ;
   
   $(document).on('mouseenter', '.pollBox', function() {
      $(this).css("background-color","#198C7D"); 
   });
   $(document).on('mouseleave', '.pollBox', function() {
      $(this).css("background-color",""); 
   });
   
   $(document).on('mouseenter','.delete', function() {
       $(this).css("color","black"); 
   });
   $(document).on('mouseleave','.delete', function() {
       $(this).css("color",""); 
   });
   
   $(document).on('mouseenter','.add', function() {
       $(this).css("background-color", "#198C7D");
   });
   $(document).on('mouseleave','.add', function() {
       $(this).css("background-color", "");
   });
   
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.deletePrompt = this.deletePrompt.bind(this);
        this.state = { polls: polls };
    }
    
    
    deletePrompt(thePoll,event) {
        var index = 0;
        var pollArr = [];
        var popup = confirm("Are you sure you want to delete this poll?");
        if (popup) {
            for (var i=0; i<this.state.polls.length; i++) {
                if (this.state.polls[i]._id == thePoll._id) {
                    
                }
                else {
                    pollArr.push(this.state.polls[i]);
                }
            }
            $.ajax({
               url: "/deletePoll/" + thePoll._id,
               method: "POST",
               dataType: 'text',
               data: { data: thePoll._id }
            });
            this.setState({ polls: pollArr });
        }
        
        
        event.stopPropagation();
        
    }
    
    getPollTable() {
        var click = this.deletePrompt;
        var pollRows = [];
        var polls = this.state.polls.slice();
        for (var i=0; i<polls.length; i++) {
            if (i==polls.length-1 && i%2==0) {
                pollRows.push(
                    <div className="row">
                        <div className="col-md-4"></div>
                        <div className="col-md-4 pollBox">
                            <Poll poll={polls[i]} deletePrompt={click} />
                        </div>
                        <div className="col-md-4"></div>
                    </div>
                    );
            }
            else if (i%2==1) {
                pollRows.push(
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4 pollBox">
                        <Poll poll={polls[i-1]} deletePrompt={click} />
                    </div>
                    <div className="col-md-1"></div>
                    <div className="col-md-1"></div>
                    <div className="col-md-4 pollBox">
                        <Poll poll={polls[i]} deletePrompt={click}/>
                    </div>
                    <div className="col-md-1"></div>
                </div>
                    );
                    
            }
        }
        return pollRows;
    }
    
    render() {
        if (!this.state.polls) {
            return (<p>You currently have no active polls. Get to posting!</p>);
        }
        else {
            return (<div>
                    {this.getPollTable()}
                    </div>
                );
        }
        
    }
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        
    }
    
    redirect() {
        window.location = "/poll/" + this.props.poll._id;
    }
    
    addOption(event) {
        var id = this.props.poll._id;
        var newOption = prompt("Enter a new option: ");
        if (newOption!=null) {
            $.ajax({
               url: "/addOption/" + this.props.poll._id + "/" + newOption,
               method:'POST'
                
            }).then(function() {
                window.location = "/poll/" + id;
            });
            
        }
        event.stopPropagation();
        
    }
    
    render() {
        var topVotes = 0;
        var topAnswer = "No votes cast yet."
        var thePoll = this.props.poll;
        
        this.props.poll.options.forEach(function(item) {
            if (item.votes > 0) {
                topVotes = item.votes;
                topAnswer = item.title;
            }
        }) ;
        
        return (
            <div className="poll" onClick={ this.redirect.bind(this) } >
                <p><span style={{color:"#72D8F7"}}>Q: </span> {this.props.poll.question}</p>
                <p><span style={{color:"#72D8F7"}}>Most voted answer: </span> {topAnswer}</p>
                <button className="delete" onClick={(event) => this.props.deletePrompt(thePoll,event)}>X</button>
                <button className="add" onClick={this.addOption.bind(this)}>Add Option</button>
            </div>    
            );
    }
}

ReactDOM.render(<App/>, document.querySelector("#polls"));


