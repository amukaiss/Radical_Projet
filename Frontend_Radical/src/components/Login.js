import { Component } from "react";
import React from "react";
import logo from "../images/aa.PNG";
import "./Login.css";
import axiosClient from "../apiClient";
// import Page from "./Page.js";
// import { Alert } from "reactstrap";
// import { Link, Route, BrowserRouter as Router, Navigate } from "react-router-dom";
// import Accueil from "./Accueil";

import { toast } from "react-toastify";
window.idUser = "";
window.username = "";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id_user: "",
      username: "",
      password: "",
      passwordType: "password",
      alertVisible: false,
      alertText: "",
      connection_status: false,
      errorMessage: {},
    };
    this.togglePassword = this.togglePassword.bind(this);
    this.setPasswordType = this.setPasswordType.bind(this);
    this.onChangeLogin = this.onChangeLogin.bind(this);
    this.onChangePwd = this.onChangePwd.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    localStorage.setItem("token", null);
  }

  onChangeLogin(e) {
    this.setState({
      username: e.target.value,
    });
  }

  onChangePwd(e) {
    this.setState({
      password: e.target.value,
    });
  }

  async handleClick() {
    window.username = this.state.username;
    const resp = await axiosClient.postRequest("/user/authenticate", {
      username: this.state.username,
      password: this.state.password,
    });

    if (resp.data.success) {
      // alert("Logged in");
      window.idUser = resp.data.data.id_user;
      let path = "/Accueil";
      this.props.history.push(path);

      toast(`Bonjour ${this.state.username} ! ^^`);
    } else {
      toast.error("Username ou Mot de passe incorrect ! ):");
      this.setState({ username: "", password: "" });
    }
  }

  onDismiss = () => {
    this.setState({ alertVisible: false });
  };

  setPasswordType(value) {
    this.setState({ passwordType: value });
  }

  togglePassword() {
    if (this.state.passwordType === "password") {
      this.setPasswordType("text");
      return;
    }
    this.setPasswordType("password");
  }

  render() {
    return (
      <div class="parent clearfix">
        <section class="vh-100" style={{ backgroundColor: "#516cb4" }}>
          <div class="container py-5 h-100">
            <div class="row d-flex justify-content-center align-items-center h-100">
              <div class="col col-xl-10">
                <div class="card" style={{ borderRadius: "1rem" }}>
                  <div class="row g-0">
                    <div class="col-md-6 col-lg-5 d-none d-md-block">
                      <img src={logo} alt="login form" class="img-fluid" style={{ borderRadius: "1rem 0 0 1rem" }} />
                    </div>
                    <div class="col-md-6 col-lg-7 d-flex align-items-center">
                      <div class="card-body p-4 p-lg-5 text-black">
                        <form>
                          <div class="d-flex align-items-center mb-3 pb-1">
                            <i class="fas fa-cubes fa-2x me-3" style={{ color: "#ff6219" }}></i>
                            <span class="h1 fw-bold mb-0">RadiCal 3.4</span>
                          </div>
                          <br />
                          <br />

                          <div class="form-outline mb-4">
                            <input
                              type="email"
                              title="Votre Email"
                              id="form2Example17"
                              class="form-control form-control-lg"
                              placeholder="Username"
                              value={this.state.username}
                              onChange={this.onChangeLogin}
                              required=""
                              novalidate="novalidate"
                            />
                          </div>

                          <div class="form-outline mb-4">
                            <input
                              title="Votre Mot de Passe"
                              type={this.state.passwordType}
                              id="form2Example27"
                              class="form-control form-control-lg"
                              placeholder="Mot de passe"
                              value={this.state.password}
                              onChange={this.onChangePwd}
                              required=""
                            />

                            {/* <button onClick={this.togglePassword} hidden>
                              {this.state.passwordType === "password" ? (
                                <i className="bi bi-eye-slash"></i>
                              ) : (
                                <i className="bi bi-eye"></i>
                              )}
                            </button> */}
                          </div>

                          <div class="pt-1 mb-4">
                            <button
                              class="btn btn-lg btn-block"
                              type="submit"
                              style={{ backgroundColor: "#e3f2fd" }}
                              onClick={this.handleClick}
                            >
                              Se Connecter
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
export default Login;
