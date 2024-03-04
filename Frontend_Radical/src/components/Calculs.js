import React, { useState } from "react";
import { Component } from "react";
import "./style.css";
import Delete from "../images/del.png";
import EditIcon from "../images/edi.png";
import CalculModal from "./CalculModal.js";
import axios from "axios";
import { toast } from "react-toastify";
import LinearProgress from "@mui/material/LinearProgress";
import { Box, Typography, withStyles } from "@material-ui/core";
import Grid from "@mui/material/Grid";
import apiClient from "../apiClient";
import { Link } from "react-router-dom";

// const FS = config.fileServer.url;
const FS = " https://localhost:444/uploads";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 5,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: "#EEEEEE",
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "#1a90ff",
  },
}))(LinearProgress);

const baseURL = apiClient.apiURL;

window.long = "";
window.emissif = "";
window.tempF = "";
window.cList = [];
window.cList2 = [];

class Calculs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      requiredItem: 0,
      abaques: [],
      calculs: [],
      projet: window.nomProjet,
      blocking: false,
    };
    this.pouvoir = React.createRef();
    this.longueur = React.createRef();
    this.tempF = React.createRef();
    this.direction = React.createRef();
    this.rayon = React.createRef();
    this.force = React.createRef();
    this.temperature = React.createRef();
    this.humidite = React.createRef();

    this.replaceModalItem = this.replaceModalItem.bind(this);
    this.saveModalDetails = this.saveModalDetails.bind(this);
    this.changeLong = this.changeLong.bind();
    this.calculer = this.calculer.bind(this);
    this.valider = this.valider.bind(this);
    this.flamme();
  }

  changeLong(e) {
    this.setState({ longueurF: e.target.value });
  }

  flamme() {
    // try {
    //   axios
    //     .post(baseURL + "/api/meteo/readflamme", {
    //       nameProject: window.nomProjet,
    //       id_user: window.idUser,
    //       id_project: window.id_project,
    //     })
    //     .then((response) => {
    //       console.log("fla:", response.data);
    //       if (response.data.success) {
    //         console.log("test: ", response.data.data);
    //         this.setState({ calculs: response.data.data });
    //       }
    //     });
    // } catch (error) {
    //   console.log(error);
    // }
    axios
      .post(FS + "/downloadByFilename", {
        filename: window.nomProjet + "_flamme.json",
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        if (typeof response.data.success === "undefined" && response.data.length !== 0) {
          let data = response.data;
          let tmpArr = [];
          data.forEach((element) => {
            tmpArr.push({
              niv3: element.niv3,
              pouvoirE: element.pouvoirE,
              longueurF: element.longueurF,
              tempF: element.tempF,
              rayon: element.rayon,
            });
          });

          let joined = this.state.calculs.concat(tmpArr);
          this.setState({ calculs: joined });
        } else {
          if (window.cList.length === 0) {
            let tmpArr2 = [];
            for (let i = 0; i < window.infos.length; i++) {
              let rayon = window.infos[i].diametre / 2;
              let mdff = window.infos[i].charge;
              let scell = Math.PI * Math.pow(rayon, 2);
              let qdot = ((1 - 0.2) * mdff * window.infos[i].chaleurC * scell) / window.infos[i].tempsC;
              let lfl_cal = 0.0148 * Math.pow(qdot, 0.4) - 1.02 * 2 * rayon;
              let pemissif = (0.35 * qdot) / (Math.PI * lfl_cal * 2 * rayon);
              let emissivite = 1 - Math.exp(-0.6 * lfl_cal);

              let tfl_cal = Math.pow(pemissif / (emissivite * 5.67e-8), 0.25);

              tmpArr2.push(
                this.createData(
                  window.infos[i].niv3,
                  (pemissif / 1000).toFixed(3),
                  lfl_cal.toFixed(3),
                  tfl_cal.toFixed(3),
                  rayon
                )
              );
              // this.state.calculs.push(
              //   this.createData(
              //     window.infos[i].niv3,
              //     (pemissif / 1000).toFixed(3),
              //     lfl_cal.toFixed(3),
              //     tfl_cal.toFixed(3),
              //     rayon
              //   )
              // );
            }
            let joined = this.state.calculs.concat(tmpArr2);
            this.setState({ calculs: joined });
          } else {
            window.cList.map((item) => {
              this.state.calculs.push(
                this.createData(item.niv3, item.pouvoirE, item.longueurF, item.tempF, item.rayon)
              );
            });
          }
        }

        // if (response.data.success || response.data.type) {
        // }
      });

    // TO REVIEW
  }

  createData(niv3, pouvoirE, longueurF, tempF, rayon) {
    return { niv3, pouvoirE, longueurF, tempF, rayon };
  }

  async valider() {
    //this.state.data.push(this.createData(this.pouvoir.current.value,this.longueur.current.value,this.tempF.current.value,
    //this.direction.current.value, this.force.current.value, this.temperature.current.value,this.humidite.current.value));
    // console.log("calculs", this.state.calculs);
    window.cList = this.state.calculs;
    console.log(this.state.calculs);
    axios
      .post(baseURL + "/api/create/flamme", {
        nameProject: window.nomProjet,
        data: this.state.calculs,
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        if (response.data.success) {
          toast(`Fichier ${window.nomProjet}_flamme.json est bien enregistré. (;`);
        } else {
          toast.error("Une erreur est produite ):");
        }
      });
  }

  updateProgress(percentage) {
    if (percentage > 100) percentage = 100;
  }

  async calculer(event) {
    event.preventDefault();
    this.setState({
      progress: 0,
      blocking: true,
    });

    var config = {
      onUploadProgress: (progressEvent) => {
        this.setState({ progress: Math.round((progressEvent.loaded * 100) / progressEvent.total) });
      },
    };

    const resp = await axios.post(
      baseURL + "/api/isoflux",
      {
        nameProject: window.nomProjet,
        fileName: `${window.nomProjet}_mnt.asc`,
        id_user: window.idUser,
        id_project: window.id_project,
      },
      config
    );
    if (resp.data.success) {
      toast(`Fichier ${window.nomProjet}_resultat.json est bien enregistré. (;`);
    } else {
      toast.error("Une erreur est produite ):");
    }
  }

  replaceModalItem(index) {
    this.setState({
      requiredItem: index,
    });
  }

  saveModalDetails(item) {
    const requiredItem = this.state.requiredItem;
    let tempbrochure = this.state.calculs;
    tempbrochure[requiredItem] = item;

    this.setState({ calculs: tempbrochure });
  }

  deleteItem(index) {
    let tempBrochure = this.state.calculs;
    tempBrochure.splice(index, 1);
    this.setState({ calculs: tempBrochure });
  }

  delete(index) {
    window.tmp.splice(index, 1);
  }

  render() {
    const data = this.state.calculs.map((item, index) => {
      return (
        <tr key={index}>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.niv3}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.pouvoirE}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.longueurF}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.tempF}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.rayon}
          </td>
          <td>
            <img
              src={EditIcon}
              data-toggle="modal"
              data-target="#calculModal"
              onClick={() => this.replaceModalItem(index)}
            />{" "}
            <img src={Delete} onClick={() => this.deleteItem(index)} />
          </td>
        </tr>
      );
    });
    const requiredItem = this.state.requiredItem;
    let modalData = this.state.calculs[requiredItem];
    if (modalData) {
      return (
        <Box sx={{ flexGrow: 1 }} display="flex" justifyContent="center" alignItems="center" p={3}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <h2>Récapitulatif</h2>
            </Grid>
            <Grid xs={12}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th class="text-center">id_OccSol (NIV_3)</th>
                    <th class="text-center">Pouvoir émissif (KW/m²)</th>
                    <th class="text-center">Longueur de flamme (m)</th>
                    <th class="text-center">Température de flamme (K)</th>
                    <th class="text-center">Rayon (m)</th>
                  </tr>
                </thead>
                <tbody>{data}</tbody>
              </table>
              <CalculModal
                niv3={modalData.niv3}
                pouvoirE={modalData.pouvoirE}
                longueurF={modalData.longueurF}
                tempF={modalData.tempF}
                rayon={modalData.rayon}
                saveModalDetails={this.saveModalDetails}
              />
            </Grid>
            <Grid xs={12}>
              <br></br>
              <br></br>
            </Grid>
            <Grid xs={12}>
              <div class="form-group row" style={{ paddingLeft: "65%", paddingTop: "20%" }}>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.valider}>
                    Valider
                  </button>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.calculer}>
                    Calculer
                  </button>
                </div>
                <div class="col-auto">
                  <Link to="/Visualiser">
                    <button type="button" class="btn btn-outline-secondary">
                      Visualiser
                    </button>
                  </Link>
                </div>
              </div>
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      return (
        <Box sx={{ flexGrow: 1 }} display="flex" justifyContent="center" alignItems="center" p={3}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <h2>Calculs</h2>
            </Grid>

            <Grid xs={12}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th class="text-center">id_OccSol (NIV_3)</th>
                    <th class="text-center">Pouvoir émissif (KW/m²)</th>
                    <th class="text-center">Longueur de flamme (m)</th>
                    <th class="text-center">Température de flamme (K)</th>
                    <th class="text-center">Rayon (m)</th>
                  </tr>
                </thead>
                <br />
                <br />
                <tbody></tbody>
              </table>
            </Grid>
            <Grid xs={12}>
              <br></br>
              <br></br>
            </Grid>
            <Grid xs={12} alignItems="center">
              <Box className="mb25" display="flex" justifyContent="center">
                <Box width="54%" mr={1}>
                  <BorderLinearProgress variant="determinate" value={this.state.progress} />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="textSecondary">{`${this.state.progress}%`}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={12}>
              <div class="form-group row" style={{ paddingLeft: "65%", paddingTop: "20%" }}>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.valider}>
                    Valider
                  </button>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-outline-secondary" onClick={this.calculer}>
                    Calculer
                  </button>
                </div>
                <div class="col-auto">
                  <Link to="/Visualiser">
                    <button type="button" class="btn btn-outline-secondary">
                      Visualiser
                    </button>
                  </Link>
                </div>
              </div>
            </Grid>
          </Grid>
        </Box>
      );
    }
  }
}

export default Calculs;
