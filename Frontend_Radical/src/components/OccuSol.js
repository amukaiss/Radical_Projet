import config from "../config.json";
import React from "react";
import { Component } from "react";
import axios from "axios";
import Delete from "../images/del.png";
import EditIcon from "../images/edi.png";
import Modal from "./Modal.js";
import * as L from "leaflet";
import "./style.css";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import BlockUi from "react-block-ui";
import axiosClient from "../apiClient";
import chroma from "chroma-js";
import NIV from "../common";

const baseURL = axiosClient.apiURL;
// const FS = config.fileServer.url;
const FS = " https://localhost:444/uploads";

window.infos = [];
window.chargeC = "";
window.hauteurS = "";
window.diametreC = "";
window.chaleurC = "";
window.tempsC = "";
window.temperatureI = "";
window.disable1 = 2;

class OccuSol extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileData: null,
      requiredItem: 0,
      data: [],
      projet: window.nomProjet,
      reload: false,
      testt: [],
      testt2: [],
      loading: false,
      blocking: false,
      color: "#516cb4",
      buttonGenerer: true,
      buttonEnregistrer: true,
      buttonAfficher: true,
    };
    this.clip = this.clip.bind(this);
    this.replaceModalItem = this.replaceModalItem.bind(this);
    this.saveModalDetails = this.saveModalDetails.bind(this);

    this.annuler = this.annuler.bind(this);
    this.enregistrer = this.enregistrer.bind(this);
    this.generer = this.generer.bind(this);
    // this.getListJson = this.getListJson.bind(this);
    // this.fonction2 = this.fonction2.bind(this);
    // this.getListJson();
  }

  // getListJson() {
  //   axiosClient.postRequest("/file/listFileJson").then((response) => response.data.data);
  // }

  createData(niv3, lib3, charge, hauteurS, diametre, chaleurC, tempsC, tempInf) {
    return { niv3, lib3, charge, hauteurS, diametre, chaleurC, tempsC, tempInf };
  }

  refresh = () => {
    // re-renders the component
    this.setState({});
  };

  // Map layout
  async componentDidMount() {
    axios
      .post(FS + "/downloadByFilename", {
        filename: window.nomProjet + "_OcSol.json",
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        if (response.data.success || response.data.length >= 1) {
          this.clip();
          this.setState({ data: response.data, buttonEnregistrer: false, buttonGenerer: false, buttonAfficher: false });
          toast(`Fichier ${window.nomProjet}_OcSol.json est bien recupéré. (;`);
        }
      });

    axios
      .post(FS + "/downloadByFilename", {
        filename: window.nomProjet + "_frontFeu.json",
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        if (response.data.success || response.data.type) {
          toast(`Fichier ${window.nomProjet}_frontFeu.json est bien recupéré. (;`);

          // Remove duplicates and sort table vegetation
          let filterDuplicate = response.data.features.filter(
            (features, index, self) =>
              self.findIndex((t) => t.properties.NIV3_14 === features.properties.NIV3_14) === index
          );
          filterDuplicate.sort((a, b) =>
            a.properties.NIV3_14 > b.properties.NIV3_14 ? 1 : b.properties.NIV3_14 > a.properties.NIV3_14 ? -1 : 0
          );

          for (let i = 0; i < filterDuplicate.length; i++) {
            this.state.testt.push(
              this.createData(
                filterDuplicate[i]["properties"]["NIV3_14"],
                filterDuplicate[i]["properties"]["LIB3_14"],
                2.422,
                1.5,
                2.5,
                16e6,
                40,
                288
              )
            );
          }
          this.setState({ testt: this.state.testt });

          if (this.state.data.length === 0) {
            this.setState({ data: this.state.testt });
          }
        }
      });
  }

  leaflet() {
    // TO REVIEW
    let map = L.map("Occmap").setView([window.lon, window.lat], 10);
    let osmLayer = L.tileLayer(
      "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    function getColor(d) {
      const lengthNIV3 = NIV.NIV3.length;
      // console.log("lenniv3:", lengthNIV3);
      var colorPalette = chroma.scale(["#fafa6e", "#00968e"]).mode("lch").colors(lengthNIV3);
      var i = 0;
      while (d !== NIV.NIV3[i] && i < 20) {
        // console.log("niv:", NIV.NIV3[i]);
        i++;
      }
      d = colorPalette[i];
      return d;
    }

    function style(feature) {
      return {
        fillColor: getColor(feature.properties.NIV3_14),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    }

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend"),
        grades = [311, 312, 313, 320, 340, 380],
        labels = [];
      // loop through our density intervals and generate a label with a colored square for each interval
      // console.log("grade: ", grades.length);
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          getColor(grades[i] + 1) +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };

    function polystyle(feature) {
      return {
        fillColor: "yellow",
        weight: 2,
        opacity: 1,
        color: "blue", //Outline color
        fillOpacity: 0.7,
      };
    }

    if (window.nomProjet && window.idUser && window.id_project) {
      axios
        .post(FS + "/downloadByFilename", {
          filename: window.nomProjet + "_test.json",
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success || response.data.type) {
            toast(`Fichier ${window.nomProjet}_test.json est bien recupéré. (;`);

            // this.setState({ rectFile: response.data.data.destination })
            // add GeoJSON layer to the map once the file is loaded
            let datalayer = L.geoJSON(response.data, {
              onEachFeature: function (feature, layer) {
                layer.on("click", function (e) {
                  let coords = e.target.feature.geometry.coordinates;

                  let field1 = document.getElementById("f1");
                  field1.innerHTML = e.target.feature.properties.NIV1_14;
                  let field11 = document.getElementById("f11");
                  field11.innerHTML = e.target.feature.properties.LIB1_14;
                  let field2 = document.getElementById("f2");
                  field2.innerHTML = e.target.feature.properties.NIV2_14;
                  let field22 = document.getElementById("f22");
                  field22.innerHTML = e.target.feature.properties.LIB2_14;
                  let field3 = document.getElementById("f3");
                  field3.innerHTML = e.target.feature.properties.NIV3_14;
                  let field33 = document.getElementById("f33");
                  field33.innerHTML = e.target.feature.properties.LIB3_14;
                });
              },
              style: style,
            }).addTo(map);

            try {
              map.fitBounds(datalayer.getBounds());
            } catch (error) {
              console.log(error);
            }
          }
        });

      axios
        .post(FS + "/downloadByFilename", {
          filename: window.nomProjet + "_frontFeu.json",
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success || response.data.type) {
            let datalayer = L.geoJSON(response.data, { style: polystyle }).addTo(map);
          }
        });
    }
  }

  hideSpinner() {
    document.getElementById("spinner").style.display = "none";
  }
  showSpinner() {
    document.getElementById("spinner").style.display = "block";
  }

  clip() {
    document.getElementById("idmap").style.display = "block";
    this.leaflet();
  }

  afficher() {
    console.log("called");
    // const options = {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //   },
    // };
    // const url = "https://localhost:443/ps2f/api/upload";
    axiosClient.getRequest("/api/upload").then((response) => {
      console.log("afficher: ", response.message);
    });
    // axios.get(url, options).then((response) => {
    //   console.log(response.message);
    //   // setTimeout(this.hideSpinner(), 50000);
    // });
  }

  delete(index) {
    window.tmp.splice(index, 1);
    //this.reload();
  }

  replaceModalItem(index) {
    this.setState({
      requiredItem: index,
    });
  }

  saveModalDetails(item) {
    const requiredItem = this.state.requiredItem;
    let tempbrochure = this.state.data;
    tempbrochure[requiredItem] = item;

    this.setState({ data: tempbrochure });
  }

  deleteItem(index) {
    let tempBrochure = this.state.data;
    tempBrochure.splice(index, 1);
    this.setState({ data: tempBrochure });
  }

  annuler() {
    this.state.data = window.list;
  }

  enregistrer() {
    window.infos = this.state.data;
    this.setState({ blocking: true });
    fetch(baseURL + "/api/clip/ocSol", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        nameProject: window.nomProjet,
        data: this.state.data,
        id_user: window.idUser,
        id_project: window.id_project,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        this.setState({ blocking: false, buttonEnregistrer: false });
        toast(`Fichier ${window.nomProjet}_OcSol.json est bien enregistré. (;`);
      });
    window.disable3 = 2;
  }

  async generer() {
    this.setState({ blocking: true });

    axiosClient
      .postRequest("/api/clip", {
        nameProject: window.nomProjet,
        filename: window.uploadedFiles.asc,
        id_user: window.idUser,
        id_project: window.id_project,
      })
      .then((response) => {
        toast(`Fichier ${window.nomProjet}_test.json est bien enregistré. (;`);
        this.setState({ blocking: false, buttonGenerer: false });
      });
  }

  render() {
    const data = this.state.data.map((item, index) => {
      return (
        <tr key={index}>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.niv3}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.lib3}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.charge}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.hauteurS}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.diametre}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.chaleurC}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.tempsC}
          </td>
          <td class="text-center" style={{ fontSize: "13px" }}>
            {item.tempInf}
          </td>
          <td>
            <img
              src={EditIcon}
              data-toggle="modal"
              data-target="#exampleModal"
              onClick={() => this.replaceModalItem(index)}
            />{" "}
            <img src={Delete} onClick={() => this.deleteItem(index)} />
          </td>
        </tr>
      );
    });

    const requiredItem = this.state.requiredItem;
    let modalData = this.state.data[requiredItem];
    if (modalData) {
      return (
        <div>
          <BlockUi tag="div" blocking={this.state.blocking}>
            <div class="form-group row">
              <div class="col">
                <h2>Occupation du Sol</h2>
              </div>
            </div>
            <div id="idmap" style={{ display: "none" }}>
              <div id="Occmap"></div>
              <div class="side">
                <p className="infos"> Liste des infos</p>
                <table style={{ width: "90%" }}>
                  <tr>
                    <th align="left">NIV1: </th>
                    <td id="f1"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB1: </th>
                    <td id="f11"></td>
                  </tr>
                  <tr>
                    <th align="left">NIV2: </th>
                    <td id="f2"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB2: </th>
                    <td id="f22"></td>
                  </tr>
                  <tr>
                    <th align="left">NIV3: </th>
                    <td id="f3"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB3: </th>
                    <td id="f33"></td>
                  </tr>
                </table>
                <br />
              </div>
            </div>
            <br />
            <br />
            <table className="table table-striped">
              <thead>
                <tr>
                  <th class="text-center">Niveau</th>
                  <th class="text-center">Intitulé</th>
                  <th class="text-center">Charge Combustion</th>
                  <th class="text-center">Hauteur de strate</th>
                  <th class="text-center">Diametre Combustible</th>
                  <th class="text-center">Chaleur Combustion</th>
                  <th class="text-center">Temps de Combustion</th>
                  <th class="text-center">Temperature d'inflammation</th>
                </tr>
              </thead>
              <br></br>
              <tbody>{data}</tbody>
            </table>
            <Modal
              niv3={modalData.niv3}
              lib3={modalData.lib3}
              charge={modalData.charge}
              hauteurS={modalData.hauteurS}
              diametre={modalData.diametre}
              chaleurC={modalData.chaleurC}
              tempsC={modalData.tempsC}
              tempInf={modalData.tempInf}
              saveModalDetails={this.saveModalDetails}
            />

            <div class="form-group row" style={{ paddingLeft: "75%", paddingTop: "8%" }}>
              <div class="col-auto ">
                <div id="spinner" class="spinner-border text-primary" role="status" style={{ display: "none" }}>
                  <span class="sr-only">Loading...</span>
                </div>
                <ClipLoader color={this.state.color} loading={this.state.loading} size={40} />
              </div>
              <div class="col-auto">
                <input
                  class="btn btn-outline-secondary"
                  disabled={!this.state.buttonGenerer}
                  type="submit"
                  value="Génerer"
                  onClick={this.generer}
                />
              </div>

              <div class="col-auto">
                <button class="btn btn-outline-secondary" disabled={!this.state.buttonAfficher} onClick={this.clip}>
                  Afficher
                </button>
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  disabled={!this.state.buttonEnregistrer}
                  class="btn btn-outline-secondary"
                  onClick={this.enregistrer}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </BlockUi>
        </div>
      );
    } else {
      return (
        <div>
          <BlockUi tag="div" blocking={this.state.blocking}>
            <div class="form-group row">
              <div class="col">
                <h2>Occupation du Sol</h2>
              </div>
            </div>

            <div id="idmap" style={{ display: "none" }}>
              <div id="Occmap"></div>
              <div class="side">
                <p className="infos"> Liste des infos</p>
                <table style={{ width: "90%" }}>
                  <tr>
                    <th align="left">NIV1: </th>
                    <td id="f1"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB1: </th>
                    <td id="f11"></td>
                  </tr>
                  <tr>
                    <th align="left">NIV2: </th>
                    <td id="f2"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB2: </th>
                    <td id="f22"></td>
                  </tr>
                  <tr>
                    <th align="left">NIV3: </th>
                    <td id="f3"></td>
                  </tr>
                  <tr>
                    <th align="left">LIB3: </th>
                    <td id="f33"></td>
                  </tr>
                </table>
                <br />
              </div>
            </div>
            <br />
            <br />
            <table className="table table-striped">
              <thead>
                <tr>
                  <th class="text-center">Niveau</th>
                  <th class="text-center">Intitulé</th>
                  <th class="text-center">Charge Combustion</th>
                  <th class="text-center">Hauteur de strate</th>
                  <th class="text-center">Diametre Combustible</th>
                  <th class="text-center">Chaleur Combustion</th>
                  <th class="text-center">Temps de Combustion</th>
                  <th class="text-center">Temperature d'inflammation</th>
                </tr>
              </thead>
              <br></br>
              <tbody></tbody>
            </table>
            <div class="form-group row" style={{ paddingLeft: "65%", paddingTop: "8%" }}>
              <div class="col-auto ">
                <div id="spinner" class="spinner-border text-primary" role="status" style={{ display: "none" }}>
                  <span class="sr-only">Loading...</span>
                </div>
                <ClipLoader color={this.state.color} loading={this.state.loading} size={40} />
              </div>
              <div class="col-auto">
                <input
                  disabled={!this.state.buttonGenerer}
                  id="generer"
                  class="btn btn-outline-secondary"
                  type="button"
                  value="Génerer"
                  onClick={this.generer}
                />
              </div>

              <div class="col-auto">
                <button class="btn btn-outline-secondary" disabled={!this.state.buttonAfficher} onClick={this.clip}>
                  Afficher
                </button>
              </div>
              <div class="col-auto">
                <input
                  disabled={!this.state.buttonEnregistrer}
                  type="button"
                  id="enregistrer"
                  class="btn btn-outline-secondary"
                  onClick={this.enregistrer}
                  value="Enregistrer"
                />
              </div>
            </div>
          </BlockUi>
        </div>
      );
    }
  }
}

export default OccuSol;
