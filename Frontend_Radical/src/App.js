import { Component } from "react";
import Page from "./components/Page";
import Login from "./components/Login.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link,
  // Redirect
} from "react-router-dom";
import "jquery/dist/jquery.min.js";
import "popper.js/dist/popper.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
// import Header from './components/Header';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

window.nomProjet = "";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/Accueil" component={Page} />
          <Route exact path="/FrontFeu" component={Page} />
          <Route exact path="/OccuSol" component={Page} />
          <Route exact path="/meteo" component={Page} />
          <Route exact path="/Calculs" component={Page} />
          <Route exact path="/Visualiser" component={Page} />
          <Route from="/Accueil" to="/login" component={Page} />
        </Switch>
        <ToastContainer
          position="bottom-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    );
  }
}

export default App;
