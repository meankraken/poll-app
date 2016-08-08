$(document).ready(function() {
   $("#addPoll").on("click", function() {
       $("#createForm").stop().css("display","block").animate({height:"350px"},250);
   }) ;
   
   $("#cancelButton").on("click", function(e) {
       e.preventDefault();
      $("#createForm").stop().animate({height:"0px"},250, function() {
          $('#createForm').css("display","none");
      });
   });
});

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return <div>Hello!</div>;
    }
}

ReactDOM.render(<App/>, document.querySelector(".test"));