$(document).ready(function() {
   $(document).on("mouseenter", "select", function() {
      $(this).css("box-shadow","0px 0px 2px 2px #2F78A8");
       
   });
   
   $(document).on("mouseleave", "select", function() {
      $(this).css("box-shadow","");
       
   });
   
   $(document).on("click", ".tweetBtn", function() {
      window.location = "https://twitter.com/intent/tweet?url=" + window.location;
   });
   
    
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { poll: [] };
    }
    
    componentDidMount() {
        this.setState({ poll: poll });
    }
    
    render() {
        return (
                <div id="AppContainer">
                    <SideBar poll={this.state.poll} />
                    <Chart options={this.state.poll.options}/>
                </div>
                );
    }
}

class SideBar extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        if (!this.props.poll.options) {
            return <div>Rendering...</div>;
        }
        
        else {
            return (
                <div id="sideBar">
                    <h2 className="question">{this.props.poll.question}</h2>
                    <form action={'/poll/' + this.props.poll._id} method='post'>
                        <select name="options">
                            {
                                this.props.poll.options.map(function(item) {
                                    return <option name={item.title}>{item.title}</option>;
                                })
                            }
                        </select>
                        <button type="submit" className="btn btn-primary submitBtn">Submit Vote</button>
                        
                        <button type="button" className="btn btn-secondary tweetBtn">Share on Twitter</button>
                    </form>
                    
                </div>
                
                );
        }
    }
}

class Chart extends React.Component {
    constructor(props) {
        super(props);
    }
    
    componentDidUpdate() {
        var height = 350; //height of the graph 
        var width = 550; //width of the graph
        
        const margin = { left:70, top:70, right:50, bottom:50 }; 
        
        var x = d3.scaleBand().domain(this.props.options.map(function(item) {
            return item.title;
        })).range([0,width]);
        
        var xAxis = d3.axisBottom(x);
        
        var votesArr = this.props.options.map(function(item) {
            return item.votes;
        });
        
        var maxVotes = d3.max(votesArr), minVotes = d3.min(votesArr);
        
        var y = d3.scaleLinear().domain([0,maxVotes]).range([height,0]);
        
        var yAxis = d3.axisLeft(y).tickFormat(d3.format('d')).ticks(maxVotes);
        
        var totalVotes = 0;
        
        this.props.options.forEach(function(item) {
            totalVotes+=item.votes;    
        });
        
        if (totalVotes > 0) {
        
            var chart = d3.select('#chartContainer').append('svg').attr('class','chart').attr("width",(width+margin.left+margin.right)+ "px").attr("height",(height+margin.top+margin.bottom)+"px");
            var bar = chart.selectAll('g').data(this.props.options).enter().append('g').attr('class','bar').attr("transform",function(d) { return "translate(" + (margin.left + x(d.title))+"," + margin.top +")"   });
            
            bar.append('rect').attr("class","bar").attr('y',function(d) { return y(d.votes); }).attr("height",function(d) { return (height-y(d.votes)); }).attr("width",function(d) { return x.bandwidth()}).attr("fill","steelBlue"); 
            
            chart.append('g').attr("class","xAxis").attr("transform", "translate(" + margin.left + "," + (height+margin.top) +  ")").call(xAxis);
            chart.append('g').attr("class","yAxis").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(yAxis);
            
            chart.append('g').attr("transform","translate(0,70)").append('text').attr("class","axisText").text("VOTES");
            
            $('.bar').hover(function() {
                var data = d3.select(this).datum();
                var wide = $(this).find('rect').attr("width");
                var high = height/2;
                d3.select(this).append('g').attr("transform","translate(" + (wide/2) + "," + high + ")").append('text').text(data.votes).attr("fill","#F24141").attr('text-anchor','middle').attr('font-size','2em').attr("font-family","impact");
                $(this).attr("fill","#79D0F2");
            }, function() {
                $(this).attr("fill","steelBlue");
                $(this).find('text').remove();
            });
        
        }
        else {
            $('#chartContainer').html("<h5>There have been no votes cast yet. Be the first to have your voice heard!</h5>");
        }
    }
    
    render() {
        if (!this.props.options) {
            return <div>Loading data...</div>;
        }
        else {
            return (
                <div id="chartContainer">
                    
                        
                
                </div>
                
                );
        }
    }
}

ReactDOM.render(<App/>, document.querySelector("#pollContainer"));




