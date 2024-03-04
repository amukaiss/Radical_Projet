import React from "react";
import { Component } from "react";
// import Edit from "../images/edit.png";
// import axios from "axios";
import "./style.css";
import axiosClient from "../apiClient";
import { toast } from "react-toastify";
import axios from "axios";
// const FS = config.fileServer.url;
const FS = " https://localhost:444/uploads";

window.dateAcquired = "";
window.timeAcquired = "";
window.deg = "";
window.force = "";
window.temp = "";
window.humi = "";

class Meteo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      visible: false,
      items: [],
      dateD: "",
      heure: "",
      time: "",
      data: [],
      projet: window.nomProjet,
    };
    this.direction = React.createRef();
    this.force = React.createRef();
    this.temperature = React.createRef();
    this.humidite = React.createRef();

    this.onChangeDateD = this.onChangeDateD.bind(this);
    this.onChangeHeure = this.onChangeHeure.bind(this);
    this.afficher = this.afficher.bind(this);
    this.annuler = this.annuler.bind(this);
    this.enregistrer = this.enregistrer.bind(this);
    this.readFile = this.readFile.bind(this);
  }
  onChangeDateD(e) {
    this.setState({
      dateD: e.target.value,
    });
  }
  onChangeHeure(e) {
    this.setState({
      heure: e.target.value,
    });
  }

  async componentDidMount() {
    axios
      .post(FS + "/downloadByFilename", {
        filename: window.nomProjet + "_meteo.json",
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        if (response.data.length === 1) {
          window.deg = response.data[0].directionV;
          window.force = response.data[0].forceV;
          window.temp = response.data[0].temperature;
          window.humi = response.data[0].Humidite;
        }
        // if (response.data.success ) {
        // }
      });

    if (window.lon !== "" && window.lat !== "") {
      // TO REVIEW
      fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" +
          window.lat +
          "&lon=" +
          window.lon +
          "&lang=fr&units=metric&appid=115c17b8db95c45e40405af01daf703e"
      )
        .then((res) => res.json())
        .then(
          (result) => {
            //console.log(result['list']);
            this.setState({
              isLoaded: true,
              items: result["list"],
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error,
            });
          }
        );
    } else {
      fetch(
        "https://api.openweathermap.org/data/2.5/forecast?q=Marseille&lang=fr&units=metric&appid=115c17b8db95c45e40405af01daf703e"
      )
        .then((res) => res.json())
        .then(
          (result) => {
            //console.log(result['list']);
            this.setState({
              isLoaded: true,
              items: result["list"],
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error,
            });
          }
        );
    }
    this.readFile();
  }

  readFile() {
    try {
      axiosClient
        .postRequest("/api/meteo", {
          nameProject: window.nomProjet,
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success) {
            window.dateAcquired = response.data.data[0].date;
            window.timeAcquired = response.data.data[0].time;
            window.deg = response.data.data[0].directionV;
            window.force = response.data.data[0].forceV;
            window.temp = response.data.data[0].temperature;
            window.humi = response.data.data[0].Humidite;
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  afficher() {
    this.setState({
      visible: true,
    });

    if (this.state.dateD !== "" && this.state.heure !== "") {
      if (this.state.heure < "03:00" && this.state.heure >= "00:00") {
        this.state.time = this.state.dateD + " 00:00";
      } else if (this.state.heure < "06:00" && this.state.heure >= "03:00") {
        this.state.time = this.state.dateD + " 03:00";
      } else if (this.state.heure < "09:00" && this.state.heure >= "06:00") {
        this.state.time = this.state.dateD + " 06:00";
      } else if (this.state.heure < "12:00" && this.state.heure >= "09:00") {
        this.state.time = this.state.dateD + " 09:00";
      } else if (this.state.heure < "15:00" && this.state.heure >= "12:00") {
        this.state.time = this.state.dateD + " 12:00";
      } else if (this.state.heure < "18:00" && this.state.heure >= "15:00") {
        this.state.time = this.state.dateD + " 15:00";
      } else if (this.state.heure < "21:00" && this.state.heure >= "18:00") {
        this.state.time = this.state.dateD + " 18:00";
      } else {
        this.state.time = this.state.dateD + " 21:00";
      }
    } else {
      this.state.time = "#";
    }
  }

  annuler() {
    window.deg = "";
    window.force = "";
    window.temp = "";
    window.humi = "";
  }

  enregistrer(e) {
    e.preventDefault();
    if (this.state.dateD !== "" && this.state.heure !== "") {
      this.state.data.push(
        this.createData(
          this.state.dateD,
          this.state.heure,
          this.direction.current.value,
          this.force.current.value,
          this.temperature.current.value,
          this.humidite.current.value
        )
      );

      // get value from form
      window.deg = this.direction.current.value;
      window.force = this.force.current.value;
      window.temp = this.temperature.current.value;
      window.humi = this.humidite.current.value;
    }

    //enregistrer dans json
    try {
      if (this.state.data.length !== 0) {
        axiosClient.postRequest("/api/create/meteo", {
          nameProject: window.nomProjet,
          data: this.state.data,
          id_user: window.idUser,
          id_project: window.id_project,
        });
      } else {
        this.state.data = [];
        window.deg = this.direction.current.value;
        window.force = this.force.current.value;
        window.temp = this.temperature.current.value;
        window.humi = this.humidite.current.value;
        this.state.data.push(
          this.createData(window.dateAcquired, window.timeAcquired, window.deg, window.force, window.temp, window.humi)
        );

        axiosClient.postRequest("/api/create/meteo", {
          nameProject: window.nomProjet,
          data: this.state.data,
          id_user: window.idUser,
          id_project: window.id_project,
        });
      }
      toast(`Fichier ${window.nomProjet}_meteo.json est bien enregistré. (;`);
    } catch (error) {
      console.log(error);
    }
    this.state.items.push(window.deg, window.force, window.temp, window.humi);
    window.disable4 = 2;
  }

  createData(date, time, directionV, forceV, temperature, Humidite) {
    return { date, time, directionV, forceV, temperature, Humidite };
  }

  // =========================================== UI =====================================================
  render() {
    const d = this.state.dateD;
    const data = this.state.items.map((item) => {
      if (this.state.dateD !== "" && this.state.heure !== "") {
        if (item.dt_txt.includes(this.state.time)) {
          if (this.state.visible) {
            return (
              <div class="card">
                <div class="card-body">
                  <div class="form-group row" style={{ paddingLeft: "150px" }}>
                    <div class="col-auto">
                      <label class="col-form-label" style={{ width: "200px" }}>
                        Direction du Vent
                      </label>
                    </div>
                    <div class="col-auto">
                      <input
                        class="form-control"
                        type="text"
                        defaultValue={item.wind.deg}
                        ref={this.direction}
                        style={{ width: "300px" }}
                      />
                    </div>
                    <div class="col-auto">
                      <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                        <option>degré</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group row" style={{ paddingLeft: "150px" }}>
                    <div class="col-auto">
                      <label class="col-form-label" style={{ width: "200px" }}>
                        Force du Vent
                      </label>
                    </div>
                    <div class="col-auto">
                      <input
                        class="form-control"
                        type="text"
                        defaultValue={item.wind.speed}
                        ref={this.force}
                        style={{ width: "300px" }}
                      />
                    </div>
                    <div class="col-auto">
                      <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                        <option>km/h</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group row" style={{ paddingLeft: "150px" }}>
                    <div class="col-auto">
                      <label class="col-form-label" style={{ width: "200px" }}>
                        Température
                      </label>
                    </div>
                    <div class="col-auto">
                      <input
                        class="form-control"
                        type="text"
                        defaultValue={item.main.temp}
                        ref={this.temperature}
                        style={{ width: "300px" }}
                      />
                    </div>
                    <div class="col-auto">
                      <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                        <option>°C</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group row" style={{ paddingLeft: "150px" }}>
                    <div class="col-auto">
                      <label class="col-form-label" style={{ width: "200px" }}>
                        Humidité
                      </label>
                    </div>
                    <div class="col-auto">
                      <input
                        class="form-control"
                        type="text"
                        defaultValue={item.main.humidity}
                        ref={this.humidite}
                        style={{ width: "300px" }}
                      />
                    </div>
                    <div class="col-auto">
                      <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                        <option>%</option>
                        <option></option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group row" style={{ paddingLeft: "700px" }}>
                    <div class="col-auto">
                      <button type="button" class="btn btn-outline-secondary" onClick={this.enregistrer}>
                        Enregistrer
                      </button>
                    </div>
                    <div class="col-auto">
                      <button type="button" class="btn btn-outline-secondary" onClick={this.annuler}>
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        }
      }
    });

    if (d) {
      return (
        <div>
          <h2>Météo</h2>
          <div class="form-group row" style={{ paddingLeft: "200px" }}>
            <div class="col">
              <input
                id="dateD"
                class="form-control"
                type="date"
                value={this.state.dateD}
                onChange={this.onChangeDateD}
              />
            </div>
            <div class="col">
              <input
                type="time"
                id="inputMDEx1"
                class="form-control"
                value={this.state.heure}
                onChange={this.onChangeHeure}
              />
            </div>
            <div class="col">
              <button class="btn btn-outline-secondary" onClick={this.afficher}>
                Générer
              </button>
            </div>
          </div>
          {data}
        </div>
      );
    } else {
      return (
        <div>
          <h2>Météo</h2>
          <div class="form-group row" style={{ paddingLeft: "200px" }}>
            <div class="col">
              <input
                id="dateD"
                class="form-control"
                type="date"
                value={this.state.dateD}
                onChange={this.onChangeDateD}
              />
            </div>
            <div class="col">
              <input
                type="time"
                id="inputMDEx1"
                class="form-control"
                value={this.state.heure}
                onChange={this.onChangeHeure}
              />
            </div>
            <div class="col">
              <button class="btn btn-outline-secondary" onClick={this.afficher}>
                Générer
              </button>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="form-group row" style={{ paddingLeft: "150px" }}>
                <div class="col-auto">
                  <label class="col-form-label" style={{ width: "200px" }}>
                    Direction du Vent
                  </label>
                </div>
                <div class="col-auto">
                  <input
                    class="form-control"
                    type="text"
                    defaultValue={window.deg}
                    ref={this.direction}
                    style={{ width: "300px" }}
                  />
                </div>
                <div class="col-auto">
                  <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                    <option>degré</option>
                  </select>
                </div>
              </div>

              <div class="form-group row" style={{ paddingLeft: "150px" }}>
                <div class="col-auto">
                  <label class="col-form-label" style={{ width: "200px" }}>
                    Force du Vent
                  </label>
                </div>
                <div class="col-auto">
                  <input
                    class="form-control"
                    type="text"
                    defaultValue={window.force}
                    ref={this.force}
                    style={{ width: "300px" }}
                  />
                </div>
                <div class="col-auto">
                  <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                    <option>km/h</option>
                  </select>
                </div>
              </div>

              <div class="form-group row" style={{ paddingLeft: "150px" }}>
                <div class="col-auto">
                  <label class="col-form-label" style={{ width: "200px" }}>
                    Température
                  </label>
                </div>
                <div class="col-auto">
                  <input
                    class="form-control"
                    type="text"
                    defaultValue={window.temp}
                    ref={this.temperature}
                    style={{ width: "300px" }}
                  />
                </div>
                <div class="col-auto">
                  <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                    <option>°C</option>
                  </select>
                </div>
              </div>

              <div class="form-group row" style={{ paddingLeft: "150px" }}>
                <div class="col-auto">
                  <label class="col-form-label" style={{ width: "200px" }}>
                    Humidité
                  </label>
                </div>
                <div class="col-auto">
                  <input
                    class="form-control"
                    type="text"
                    defaultValue={window.humi}
                    ref={this.humidite}
                    style={{ width: "300px" }}
                  />
                </div>
                <div class="col-auto">
                  <select class="form-control" placeholder="Parcours" style={{ width: "100px" }}>
                    <option>%</option>
                    <option></option>
                  </select>
                </div>
              </div>
              <div class="form-group row" style={{ paddingLeft: "700px" }}>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.enregistrer}>
                    Enregistrer
                  </button>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.annuler}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Meteo;
