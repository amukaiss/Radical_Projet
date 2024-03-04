import React from "react";
import { Component } from "react";
import "../App.css";
// import Login from "./Login";
// import { useHistory } from "react-router-dom";
import { Route, BrowserRouter as Router, Redirect } from "react-router-dom";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectionLogout: false,
    };
    this.logOut = this.logOut.bind(this);
  }

  logOut() {
    this.setState({ redirectionLogout: true });
    //let path = "/login";
    //this.props.history.push(path);
    //this.props.navigation.navigate('/Login');
  }
  render() {
    if (this.state.redirectionLogout) {
      return <Redirect to="/login" />;
    } else {
      return (
        <nav class="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "#e3f2fd", height: "45px" }}>
          <div class="container-fluid">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page"></a>
              </li>
            </ul>
            <span style={{ paddingLeft: "300px" }}>
              <button className="btn btn-outline-secondary" onClick={(e) => this.logOut()}>
                Se déconnecter
              </button>
            </span>
          </div>
        </nav>
      );
    }
  }
}
export default Header;
