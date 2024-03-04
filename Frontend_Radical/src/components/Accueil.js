import React from "react";
import { Component } from "react";
// import PropTypes from "prop-types";
import "./style.css";
import axiosClient from "../apiClient";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";
// import { ActionMeta, OnChangeValue } from "react-select";
import IconButton from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
// import Button from "@material-ui/core/Button";
// import { makeStyles, withStyles } from "@material-ui/core/styles";

const customSelectStyles = {
  option: (styles, { isSelected }) => ({
    ...styles,
    color: "black",
    backgroundColor: isSelected ? "#36B37E" : "white",
    color: isSelected ? "white" : "black",
  }),
  control: (styles, { selectProps: { width } }) => ({
    ...styles,
    height: "20px",
    width: width,
    color: "white",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#36B37E",
  }),
  indicatorSeparator: (styles) => ({
    ...styles,
    height: "20px",
  }),
};

window.id_project = "";
class Accueil extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listProjects: [],
      options: [],
      isLoading: false,
      value: undefined,
      buttonSave: "Enregistrer",
      buttonCreate: "Créer",
    };

    // this.handleLoad = this.handleLoad.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.enregistrer = this.enregistrer.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  async componentDidMount() {
    await this.getProjects();
  }

  handleChange(newValue, actionMeta) {
    if (!newValue) {
      this.setState({ value: undefined });
    }
    if (newValue) {
      this.setState({ value: newValue.value });
    }
  }

  handleCreate(inputValue) {
    this.setState({ isLoading: true });
    const newOption = {
      value: inputValue,
      label: inputValue,
    };
    this.setState({
      isLoading: false,
      options: [...this.state.options, newOption],
      value: newOption.value,
    });
  }

  // handleChangeProject(selectedOption) {

  //   this.setState({ projet: selectedOption.value });
  // }

  async getProjects() {
    if (this.state.options.length === 0) {
      axiosClient
        .postRequest("/project/getByIdUser", {
          id_user: window.idUser,
        })
        .then((response) => {
          if (response.data.success) {
            const projects = response.data.data;
            let tmpArr = [];
            projects.forEach((element) => {
              tmpArr.push({ value: element.title, label: element.title });
            });
            let joined = this.state.options.concat(tmpArr);
            this.setState({ options: joined, listProjects: joined });
            if (this.state.options.length != 0) {
              toast("Liste des projets sont accessibles à l'entrée.");
              this.setState({ value: this.state.options[0].value });
            }
          } else {
            toast.error("Erreur lors de la récupération des projets !");
          }
        });
    }
  }

  deleteProject() {
    if (this.state.options.length === 0) {
      toast("Vous n'avez pas encore de projet. Allez créer un (;");
    }
    toast("Cette fonctionnalité sera prochainement disponible. (;");
  }

  enregistrer() {
    if (!this.state.value) {
      toast.error("Nom de projet manquant ! ):");
    }
    window.nomProjet = this.state.value;
    window.disable1 = 2;
    axiosClient
      .postRequest("/project/createProject", {
        id_user: window.idUser,
        title: window.nomProjet,
      })
      .then((response) => {
        // If project already existed for user, return old one
        if (response.data.status === 200) {
          window.id_project = response.data.data._id;
          toast(`Projet ${window.nomProjet} est bien enregistré! (:`);
          return response;
        }
        if (response.data.status === 409) {
          window.id_project = response.data.data[0]._id;
          toast(`Projet ${window.nomProjet} est bien récupéré! (:`);
          return response;
        }
        toast.error("Veuillez saisir un nom de projet !");
        return response;
      });
    // Reinitate data
    window.dateAcquired = "";
    window.timeAcquired = "";
    window.deg = "";
    window.force = "";
    window.temp = "";
    window.humi = "";
    window.bboxN = [];
    window.bboxS = [];
    window.lon = "";
    window.lat = "";
    window.uploadedFileName = "";
    window.list = [];
    window.uploadedFiles = {};
    window.drawnItem = null;
    window.long = "";
    window.emissif = "";
    window.tempF = "";
    window.cList = [];
    window.cList2 = [];
  }

  render() {
    // const { classes } = this.props;
    return (
      <div>
        <br />
        <br />
        <br />
        <br />
        <div style={{ paddingLeft: "40%" }}>
          <h2>{window.nameApp}</h2>
          <br />
        </div>

        <div class="form-group row" style={{ paddingLeft: "25%" }}>
          {/* <div class="col-auto"> */}
          <CreatableSelect
            defaultValue={this.state.value}
            onChange={this.handleChange}
            onCreateOption={this.handleCreate}
            options={this.state.options}
            isDisabled={this.state.isLoading}
            isLoading={this.state.isLoading}
            styles={customSelectStyles}
            width="400px"
            placeholder="Créez ou choisissez un projet"
            isClearable
          />
          {/* </div> */}
          <div class="col-auto">
            <Stack direction="row" spacing={2}>
              <IconButton
                sx={{ minHeight: 0, minWidth: 0, padding: 0 }}
                variant="outlined"
                justifyContent="center"
                alignItems="center"
                style={{ width: "40px", height: "40px", borderColor: "red" }}
                onClick={this.deleteProject}
              >
                <DeleteIcon
                  justifyContent="center"
                  alignItems="center"
                  style={{ color: "red", fontSize: 20 }}
                ></DeleteIcon>
              </IconButton>
            </Stack>
          </div>
          <div class="col-auto">
            <script></script>
            <button type="button" class="btn btn-outline-secondary" onClick={this.enregistrer}>
              Enregistrer
            </button>
          </div>
        </div>
        {/* <Button className={`${classes.btn} ${classes.btn4}`}>{this.state.buttonSave}</Button> */}
      </div>
    );
  }
}
// Accueil.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

// export default withStyles(useStyles)(Accueil);
export default Accueil;

// const useStyles = (theme) => ({
//   container: {
//     position: "absolute",
//     left: "50%",
//     top: "50%",
//     transform: "translate(-50%, -50%)",
//     textAlign: "center",
//   },
//   btn: {
//     border: "none",
//     margin: 20,
//     width: 250,
//     height: 65,
//     borderRadius: 6,
//     textTransform: "uppercase",
//     boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
//     cursor: "pointer",
//     color: "#fff",
//     backgroundSize: "200%",
//     transition: "0.4s",
//     "&:hover": {
//       backgroundPosition: "right",
//     },
//   },
//   btn1: {
//     backgroundImage: "linear-gradient(45deg, #FFC312, #EE5A24, #00A8FF)",
//   },
//   btn2: {
//     backgroundImage: "linear-gradient(45deg, #e74c3c, #8e44ad, #f1c40f)",
//   },
//   btn3: {
//     backgroundImage: "linear-gradient(to left, #c0392b, #27ae60, #f39c12)",
//   },
//   btn4: {
//     backgroundImage: "linear-gradient(to left, #34495e, #9b59b6, #3498db)",
//   },
// });
