import React from "react";
import { Component } from "react";
import "./style.css";
import axios from "axios";
import * as L from "leaflet";
import "leaflet-draw";
import { Form, Button } from "react-bootstrap";
import BlockUi from "react-block-ui";
import axiosClient from "../apiClient";
import chroma from "chroma-js";
import common from "../common";
import config from "../config.json";
// import ClipLoader from "react-spinners/ClipLoader";
// import { Helmet } from "react-helmet";
// import * as path from "path";
// import common from "../common";
// const FS = config.fileServer.url;
const FS = " https://radical.valabre.net:444/uploads";
// const colors = {
//   crimsonRed: "#9D0208",
//   guardsmanRed: "#D00000",
//   grenadier: "#DC2F02",
//   trinidad: "#E85D04",
//   tahitiGold: "#F48C06",
//   selectiveYellow: "#FFBA08",
// };

// const colorsMix = {
//   apple: "#4E9F3D",
//   pacificBlue: "#00AFC1",
//   gigas: "#5534A5",
//   mySin: "#FFB830",
//   torchRed: "#FF2442",
// };

class Visualiser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
      geojsonFile: "",
    };
    this.getGeoJSON = this.getGeoJSON.bind(this);
  }

  async componentDidMount() {
    let map;
    let maxZ = 60;
    let minZ = 0;
    let arrLegend = common.Z;
    document.getElementById("visualMap").innerHTML = "<div id='map'></div>";
    // Set view for map
    map = L.map("map", {
      minZoom: 10,
      maxZoom: 30,
    }).setView([43.83087870215773, 7.197276443386551], 10); // zone Nice

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

    // Display the converted geojson
    if (window.nomProjet && window.idUser && window.id_project) {
      axios
        .post(FS + "/downloadByFilename", {
          filename: window.nomProjet + "_converted.geojson",
          id_user: window.idUser,
          id_project: window.id_project,
        })
        .then((response) => {
          if (response.data.success || response.data.type) {
            maxZ = this.getMaxZ(response.data.features, "properties");
            minZ = this.getMinZ(response.data.features, "properties");
            let datalayer = L.geoJSON(response.data, { style: style }).addTo(map);
            map.fitBounds(datalayer.getBounds());
          }
        });
    }

    function getColor(d) {
      let colorPalette = chroma.scale(["blue", "cyan", "green", "yellow", "red"]).mode("lch").colors(arrLegend.length);
      let i = 0;
      while (d > arrLegend[i]) {
        i++;
      }
      d = colorPalette[i];
      return d;
    }

    function style(features) {
      return {
        // fillColor: getColor(features.properties.z),
        // fillOpacity: 0.7,
        weight: 3,
        opacity: 1,
        // color: "white",
        color: getColor(features.properties.z),
        dashArray: "4",
      };
    }

    let interval = 5;
    const length = (maxZ - minZ) / interval + 1;
    arrLegend = Array.from({ length }, (_, i) => minZ + i * interval);
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend"),
        // TO REVIEW
        grades = arrLegend,
        labels = ["<strong>Heights</strong>"];
      // categories = ['']

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += labels.push(
          '<i style="background:' +
          getColor(grades[i]) +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+")
        );
        div.innerHTML = labels.join("<br>");
      }
      return div;
    };
    legend.addTo(map);
  }

  //https://stackoverflow.com/questions/22949597/getting-max-values-in-json-array
  getMaxZ(arr, prop) {
    let max = null;
    for (let i = 0; i < arr.length; i++) {
      if (max === null || parseInt(arr[i][prop].z) > parseInt(max)) {
        max = arr[i][prop].z;
      }
    }
    return max;
  }

  getMinZ(arr, prop) {
    let min = null;
    for (let i = 0; i < arr.length; i++) {
      if (min === null || parseInt(arr[i][prop].z) < parseInt(min)) {
        min = arr[i][prop].z;
      }
    }
    return min;
  }

  async getGeoJSON(event) {
    event.preventDefault();
    this.setState({ blocking: true });
    let resp = await axiosClient.postRequest("/visualize/getVisualizationWithArgument", {
      nameProject: window.nomProjet,
      id_user: window.idUser,
      id_project: window.id_project,
    });
    if (resp.data.success) {
      this.componentDidMount();
      this.setState({ blocking: false });
    }
    this.componentDidMount();
  }

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blocking}>
          <h2>Visualisation</h2>
          <div id="visualMap"></div>
          <div class="container">
            <Form>
              <Button onClick={this.getGeoJSON}>Tracer ..</Button>
            </Form>
            <script></script>
          </div>
        </BlockUi>
      </div>
    );
  }
}

export default Visualiser;
