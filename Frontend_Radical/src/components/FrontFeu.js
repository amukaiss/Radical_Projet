import React from "react";
import { Component } from "react";
import axios from "axios";
import "./style.css";
import * as L from "leaflet";
import $ from "jquery";
import "leaflet-draw";
import { Form, Row, Col, Button, Container, FormGroup } from "react-bootstrap";
import axiosClient from "../apiClient";
import BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import { toast } from "react-toastify";
import LinearProgress from "@mui/material/LinearProgress";
import { Box, Typography, withStyles } from "@material-ui/core";
// import apiClient from "../apiClient";
// import common from "../common";
import config from "../config.json";
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
// const baseURL = apiClient.apiURL;

window.bboxN = [];
window.bboxS = [];
window.lon = "";
window.lat = "";
window.uploadedFileName = "";
window.list = [];
window.uploadedFiles = {};
window.drawnItem = null;
class FrontFeu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      fileData: null,
      fileResp: null,
      niv1: "",
      blocking: false,
      progress: 0,
      setProgress: null,
      buttonFront: true,
      buttonRect: true,
    };
    this.longtitude = React.createRef();
    this.latitude = React.createRef();

    this.toggleBlocking = this.toggleBlocking.bind(this);
    this.onChangeDonnées = this.onChangeDonnées.bind(this);
    this.onChangeLabel = this.onChangeLabel.bind(this);
    this.export = this.export.bind(this);
    this.valider = this.valider.bind(this);
    this.annuler = this.annuler.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.locate = this.locate.bind(this);
    this.getCenter = this.getCenter.bind(this);
    this.getBbox = this.getBbox.bind(this);
    this.fixCenter = this.fixCenter.bind(this);
  }

  onChangeDonnées(e) {
    this.setState({
      données: e.target.value,
    });
  }
  onChangeLabel(e) {
    this.setState({
      label: e.target.value,
    });
  }

  annuler() {
    if (window.confirm("Etes-vous sur de vouloir recommencer à nouveau")) {
      axiosClient
        .deleteRequest("/api/delete", { projectName: window.nomProjet })
        .then((response) => response)
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("annuler");
    }
  }

  // Button Enregistrer
  export(e) {
    this.setState({ blocking: true });
    e.preventDefault();

    const fil = document.querySelector("#result").innerText;
    axiosClient
      .postRequest("/api/export", {
        data: fil,
        nameProject: window.nomProjet,
        id_project: window.id_project,
        id_user: window.idUser,
      })
      .then((response) => {
        if (response.data.success || response.data.type) {
          toast(`Fichier ${window.nomProjet}_rectangle.json est bien enregistré. (;`);
        } else {
          toast.error(`Une erreur est survenue!`);
        }
        this.setState({ blocking: false });
      });

    window.disable2 = 2;
  }

  async afficher() {
    const resp = await axiosClient.postRequest("/api/upload/front", {
      nameProject: window.nomProjet,
      filename: window.uploadedFiles.asc,
      id_user: window.idUser,
      id_project: window.id_project,
    });
    return resp;
  }

  async valider(e) {
    e.preventDefault();
    // Check if there is OcuSol file
    const findJsonResp = await axiosClient.postRequest("/file/findJson", {
      // const findJsonResp = axiosClient.postRequest("/file/findJson", {
      id_project: window.id_project,
    });
    if (findJsonResp.data.status === 200) {
      this.setState({ blocking: true });
      // const fil = document.querySelector("#show").innerText;
      const fil = window.drawnItem;
      // Create the frontFeu file
      await axiosClient.postRequest("/api/file", {
        data: fil,
        nameProject: window.nomProjet,
        id_user: window.idUser,
        id_project: window.id_project,
      });

      await this.afficher();
      this.setState({ blocking: false });
      this.componentDidMount();
    } else {
      toast.error("Veuillez télécharger le fichier Occupation de Sol. (;");
    }

    // this.componentDidMount();
  }

  /*
   * Leaflet expects [latitude, longitude] order
   * GeoJSON expects [longitude, latitude] order
   */
  async componentDidMount() {
    let map;
    document.getElementById("map-container").innerHTML = "<div id='map'></div>";
    // let map = L.map('map').setView([43.2803051, 5.2404106], 11); // custom coordination //Marseille
    // TO REVIEW
    if (window.lon === "" && window.lat === "") {
      if (this.longtitude.current.value !== "" && this.latitude.current.value !== "") {
        map = L.map("map").setView([this.latitude.current.value, this.longtitude.current.value], 10); // custom coordination
      } else {
        map = L.map("map").setView([43.83087870215773, 7.197276443386551], 10); // zone Nice
      }
    } else {
      map = L.map("map").setView([window.lat, window.lon], 10);
    }

    if (window.bboxN.length !== 0 && window.bboxS.length !== 0) {
      const bounds = [
        [window.bboxN[1], window.bboxN[0]],
        [window.bboxS[1], window.bboxS[0]],
      ];

      const boundingBox = L.rectangle(bounds, { color: "red", weight: 2, fillOpacity: 0 });
      map.addLayer(boundingBox);
    }

    let osmLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    let basicMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    });

    let topoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    });
    let layerSwitcher = L.control.layers({ OpenStreetMap: osmLayer, "Basic Map": basicMap, "Topo Map": topoMap });
    layerSwitcher.addTo(map);

    // FeatureGroup is to store editable layers
    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
      draw: {
        polyline: {
          shapeOptions: {
            color: "#ffff",
            weight: 4,
          },
        },
        rectangle: {
          shapeOptions: {
            color: "#ffee00",
            weight: 4,
          },
        },
        polygon: false,
        circle: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });
    map.addControl(drawControl);

    map.on("draw:created", async function (event) {
      let layer = event.layer,
        feature = (layer.feature = layer.feature || {});

      feature.type = feature.type || "Feature";
      let props = (feature.properties = feature.properties || {});
      drawnItems.addLayer(layer);
      window.drawnItem = drawnItems.toGeoJSON();
    });
    function getColor(d) {
      return d < 14
        ? "#FED976"
        : d < 24
        ? "#FEB24C"
        : d < 33
        ? "#FD8D3C"
        : d < 42
        ? "#FC4E2A"
        : d < 52
        ? "#E31A1C"
        : "#BD0026";
    }
    function style(feature) {
      return {
        fillColor: getColor(feature.properties.NIV2_14),
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
        // TO REVIEW
        grades = [12, 14, 24, 33, 42, 52],
        labels = [];
      // loop through our density intervals and generate a label with a colored square for each interval
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

    if (window.nomProjet && window.idUser && window.id_project) {
      axios
        .post(FS + "/downloadByFilename", {
          filename: window.nomProjet + "_rectangle.json",
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success || response.data.type) {
            this.setState({ buttonRect: false });
            let datalayer1 = L.geoJSON(response.data, { style: polystyle }).addTo(map);
            map.fitBounds(datalayer1.getBounds());
          }
        });

      axios
        .post(FS + "/downloadByFilename", {
          filename: window.nomProjet + "_frontLine.json",
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success || response.data.type) {
            this.setState({ buttonFront: false });
            let datalayer2 = L.geoJSON(response.data).addTo(map);
            map.fitBounds(datalayer2.getBounds());
          }
        });
    }

    function polystyle(feature) {
      return {
        fillColor: "cyan",
        weight: 2,
        opacity: 1,
        color: "yellow", //Outline color
        fillOpacity: 0.7,
      };
    }

    // Button Valider
    // document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("valider").addEventListener("click", function () {
      $("#show").html(JSON.stringify(drawnItems.toGeoJSON()));
    });
    // });
    // document.addEventListener("DOMContentLoaded", () => {
    // Button Enregistrer
    document.getElementById("convert").addEventListener("click", function () {
      //drawnItems.getLayers().filter(l=>l instanceof L.Rectangle).forEach(l=>map.remove(l));
      $("#result").html(JSON.stringify(drawnItems.toGeoJSON()));
    });
    // });
  }

  //=================================  Center GPS Section ==================================

  async getCenter(req) {
    const resp = await axiosClient.postRequest("/api/upload/centerMNT", {
      filename: req.filename,
      id_user: req.id_user,
      id_project: req.id_project,
      destination: req.destination,
    });
    return resp;
  }

  fixCenter() {
    this.componentDidMount();
  }

  async getBbox(req) {
    const resp = await axiosClient.postRequest("/api/upload/getbbox", {
      filename: req.filename,
      id_user: req.id_user,
      id_project: req.id_project,
      destination: req.destination,
    });
    console.log(resp);
    return resp;
  }

  // Set view GPS coordinates
  locate() {
    window.lon = this.longtitude.current.value;
    window.lat = this.latitude.current.value;
    this.componentDidMount();
  }
  //=================================  END Center GPS Section ==============================

  //================================= Upload Section ========================================
  getFile = (e) => {
    this.setState({
      fileData: e.target.files[0],
    });
  };

  async uploadFile(event) {
    event.preventDefault();
    //this.showSpinner();
    this.setState({ blocking: false, progress: 0 });
    let formData = new FormData();
    formData.append("file", this.state.fileData);
    formData.append("id_user", window.idUser);
    formData.append("id_project", window.id_project);
    let ext = this.state.fileData.name.split(".").pop();
    if (ext === "asc") {
      formData.append("nameProject", window.nomProjet);
      formData.append("type", "asc");
    }
    if (ext === "json") {
      formData.append("nameProject", window.nomProjet);
      formData.append("type", "osc");
    }
    var config = {
      onUploadProgress: (progressEvent) => {
        this.setState({ progress: Math.round((progressEvent.loaded * 100) / progressEvent.total) });
      },
    };

    const resp = await axios.post(FS + "/single", formData, config);
    if (resp.data.success) {
      this.setState({ blocking: false });
      window.uploadedFileName = resp.data.data.filename;
      toast(`Fichier ${this.state.fileData.name} est bien téléchargé! (:`);
      let fileNameExtension = window.uploadedFileName.split(".").pop();
      if (fileNameExtension === "asc") {
        const bbox = await this.getBbox(resp.data.data);
        window.bboxN = bbox.data[0].coords;
        window.bboxS = bbox.data[1].coords;

        const center = await this.getCenter(resp.data.data);
        window.lon = center.data.data.longtitude;
        window.lat = center.data.data.latitude;
        this.longtitude.current.value = center.data.data.longtitude;
        this.latitude.current.value = center.data.data.latitude;

        // // if the extension of file is asc (le mnt)
        // // then we check:
        // // - if the list uploaded files contains name of asc file or not
        // // - or if it already has the asc value
        // // in both case, we add/overwrite the new value
        if (!window.uploadedFiles.hasOwnProperty("mnt") || !window.uploadedFiles.mnt) {
          window.uploadedFiles.mnt = window.uploadedFileName;
        }
        this.componentDidMount();
      }
      // if the extension of file is osc (l'occupation de sol)
      // then we check:
      // - if the list uploaded files contains name of osc file or not
      // - or if it already has the osc value
      // in both case, we add/overwrite the new value
      if (fileNameExtension === "json") {
        if (!window.uploadedFiles.hasOwnProperty("osc") || !window.uploadedFiles.ocs) {
          window.uploadedFiles.asc = window.uploadedFileName;
        }
      }
    } else {
      this.setState({ blocking: false });
      toast.error("Une erreur est survenue! ):");
    }
  }

  //=============================== END Upload Section ========================================

  toggleBlocking() {
    this.setState({ blocking: !this.state.blocking });
  }
  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blocking}>
          <Container fluid>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <Form.Label>
                    <h4>Modèle numérique de terrain & Occupation du Sol</h4>
                  </Form.Label>
                  <form onSubmit={this.uploadFile}>
                    <input type="file" name="file" onChange={this.getFile} required />
                    <input
                      // disabled={!this.state.button}
                      class="btn btn-outline-secondary"
                      type="submit"
                      value="Upload"
                      onClick={this.toggleBlocking}
                    />
                  </form>
                  <br />
                  <Box className="mb25" display="flex" alignItems="center">
                    <Box width="54%" mr={1}>
                      <BorderLinearProgress variant="determinate" value={this.state.progress} />
                    </Box>
                    <Box minWidth={35}>
                      <Typography variant="body2" color="textSecondary">{`${this.state.progress}%`}</Typography>
                    </Box>
                  </Box>
                </FormGroup>
              </Col>

              <Col style={{ height: "10px" }}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <h4>Longtitude</h4>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrer Longtitude"
                    defaultValue={window.lon}
                    ref={this.longtitude}
                    size="auto"
                    // style={{ width: "200px" }}
                  />
                  <Form.Text className="text-muted">! WGS84 Format</Form.Text>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group clasName="mb-3">
                  <Form.Label>
                    <h4>Latitude</h4>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrer Latitude"
                    defaultValue={window.lat}
                    ref={this.latitude}
                    size="auto"
                    // style={{ width: "200px" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={{ span: 3, offset: 9 }}>
                <Row xs="auto" style={{ height: "10px" }}>
                  <Col xs="auto">
                    <acronym title="Reprendre le point centrale">
                      <Button onClick={this.fixCenter}>Relocaliser</Button>
                    </acronym>
                  </Col>
                  <Col xs="auto">
                    <Button onClick={this.locate}>Localise</Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>

          <div id="map-container"></div>

          <div class="form-group row" style={{ paddingLeft: "55%" }}>
            <div class="col-auto">
              <input
                disabled={!this.state.buttonFront}
                id="valider"
                type="button"
                class="btn btn-outline-secondary"
                value="Valider FrontFeu"
                onClick={this.valider}
              />
            </div>
            <div class="col-auto">
              <input
                disabled={!this.state.buttonRect}
                id="convert"
                type="button"
                class="btn btn-outline-secondary"
                value="Enregistrer"
                onClick={this.export}
              />
            </div>
            {/* <div class="col-auto">
              <input
                // disabled={!this.state.button}
                type="button"
                class="btn btn-outline-secondary"
                value="Annuler"
                onClick={() => this.annuler("out.json")}
              />
            </div> */}
          </div>

          <label id="result" style={{ display: "none" }} />
          <label id="show" style={{ display: "none" }} />
          {/* <script></script> */}
        </BlockUi>
      </div>
    );
  }
}

export default FrontFeu;
