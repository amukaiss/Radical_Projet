import React from "react";
import { Component } from "react";
import "./Page.css";
import Header from "./Header.js";
import PMeteo from "./Meteo.js";
import FrontFeu from "./FrontFeu.js";
import Home from "../images/home.png";
import Maps from "../images/maps.png";
import Meteo from "../images/meteo.png";
import Sol from "../images/sol.png";
import Calcul from "../images/math.png";
import Eye from "../images/eye.png";

import { NavLink, Route, BrowserRouter as Router, Redirect } from "react-router-dom";
import OccuSol from "./OccuSol";
import Calculs from "./Calculs";
import Visualiser from "./Visualiser";
import Accueil from "./Accueil";
import Login from "./Login";

window.nameApp = "Radical 3.4";
window.disable1 = 2;
window.disable2 = 2;
window.disable3 = 2;
window.disable4 = 2;
window.disable5 = 2;
class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statut: true,
    };
  }
  disable1Click = (e) => {
    if (window.disable1 === 1) {
      e.preventDefault();
    }
  };

  disable2Click = (e) => {
    if (window.disable2 === 1) {
      e.preventDefault();
    }
  };
  disable3Click = (e) => {
    if (window.disable3 === 1) {
      e.preventDefault();
    }
  };
  disable4Click = (e) => {
    if (window.disable4 === 1) {
      e.preventDefault();
    }
  };
  disable5Click = (e) => {
    if (window.disable5 === 1) {
      e.preventDefault();
    }
  };

  logOut() {
    this.setState({ statut: false });
  }

  render() {
    return (
      <div id="parent">
        <body style={{ width: "100%" }}>
          {/*TO REVIEW */}
          <script src="https://kit.fontawesome.com/b99e675b6e.js"></script>

          <div class="wrapper2">
            <div class="sidebar">
              <h2>{window.nameApp}</h2>
              <ul>
                <li>
                  <NavLink activeClassName="active" to="/Accueil">
                    <a href="#">
                      <img src={Home} />
                      <span style={{ paddingLeft: "15px" }}>Accueil</span>
                    </a>
                  </NavLink>
                </li>
                <acronym title="Création du Front, récupération de l'occupation de sol et MNT">
                  <li>
                    <NavLink activeClassName="active" to="/FrontFeu" onClick={(e) => this.disable1Click(e)}>
                      <a href="#">
                        <img src={Maps} />
                        <span style={{ paddingLeft: "15px" }}>Front de Feu & MNT</span>
                      </a>
                    </NavLink>
                  </li>
                </acronym>
                <acronym title="Liste des occupations de sol">
                  <li>
                    <NavLink activeClassName="active" to="/OccuSol" onClick={(e) => this.disable2Click(e)}>
                      <a href="#">
                        <img src={Sol} />
                        <span style={{ paddingLeft: "15px" }}>Occupation du Sol</span>
                      </a>
                    </NavLink>
                  </li>
                </acronym>
                <acronym title="Saisie de la météo">
                  <li>
                    <NavLink activeClassName="active" to="/meteo" onClick={(e) => this.disable3Click(e)}>
                      <a href="#">
                        <img src={Meteo} />
                        <span style={{ paddingLeft: "15px" }}>Météo</span>
                      </a>
                    </NavLink>
                  </li>
                </acronym>
                <acronym title="Calculs">
                  <li>
                    <NavLink activeClassName="active" to="/Calculs" onClick={(e) => this.disable4Click(e)}>
                      <a href="#">
                        <img src={Calcul} />
                        <span style={{ paddingLeft: "15px" }}>Calculs</span>
                      </a>
                    </NavLink>
                  </li>
                </acronym>
                <acronym title="Affichage des isoflux">
                  <li>
                    <NavLink activeClassName="active" to="/Visualiser" onClick={(e) => this.disable5Click(e)}>
                      <a href="#">
                        <img src={Eye} />
                        <span style={{ paddingLeft: "15px" }}>Visualisation</span>
                      </a>
                    </NavLink>
                  </li>
                </acronym>
              </ul>
            </div>

            <div class="main_content">
              <Header />
              <div class="info">
                <div>
                  <Route path="/Accueil">
                    <Accueil />
                  </Route>
                  <Route path="/FrontFeu">
                    <FrontFeu />
                  </Route>
                  <Route path="/OccuSol">
                    <OccuSol />
                  </Route>
                  <Route path="/meteo">
                    <PMeteo />
                  </Route>
                  <Route path="/Calculs">
                    <Calculs />
                  </Route>
                  <Route path="/Visualiser">
                    <Visualiser />
                  </Route>
                </div>
              </div>
            </div>
          </div>
        </body>

        <footer id="chat"></footer>
      </div>
    );
  }
}
export default Page;
