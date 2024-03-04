import React, { Component } from "react";

class Modal extends Component {
  constructor(props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
    this.state = {
      niv3: "",
      lib3: "",
      charge: 0,
      hauteurS: "",
      diametre: "",
      chaleurC: "",
      tempsC: "",
      tempInf: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      niv3: nextProps.niv3,
      lib3: nextProps.lib3,
      charge: nextProps.charge,
      hauteurS: nextProps.hauteurS,
      diametre: nextProps.diametre,
      chaleurC: nextProps.chaleurC,
      tempsC: nextProps.tempsC,
      tempInf: nextProps.tempInf,
    });
  }

  nivHandler(e) {
    this.setState({ niv3: e.target.value });
  }
  libHandler(e) {
    this.setState({ lib3: e.target.value });
  }
  chargeHandler(e) {
    this.setState({ charge: e.target.value });
  }
  hauteurHandler(e) {
    this.setState({ hauteurS: e.target.value });
  }
  diametreHandler(e) {
    this.setState({ diametre: e.target.value });
  }
  chaleurHandler(e) {
    this.setState({ chaleurC: e.target.value });
  }
  tempsHandler(e) {
    this.setState({ tempsC: e.target.value });
  }
  temperatureHandler(e) {
    this.setState({ tempInf: e.target.value });
  }
  handleSave() {
    const item = this.state;
    this.props.saveModalDetails(item);
  }

  render() {
    return (
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Modifier
              </h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                <span className="modal-lable">Niveau: </span>
                <input class="form-control" value={this.state.niv3} onChange={(e) => this.nivHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Libelé: </span>
                <input class="form-control" value={this.state.lib3} onChange={(e) => this.libHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Charge de combustion: </span>
                <input class="form-control" value={this.state.charge} onChange={(e) => this.chargeHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Hauteur de strate: </span>
                <input class="form-control" value={this.state.hauteurS} onChange={(e) => this.hauteurHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Diamètre du combustible: </span>
                <input class="form-control" value={this.state.diametre} />
              </p>
              <p>
                <span className="modal-lable">Chaleur de combustion: </span>
                <input class="form-control" value={this.state.chaleurC} onChange={(e) => this.chaleurHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Temps de combustion: </span>
                <input class="form-control" value={this.state.tempsC} onChange={(e) => this.tempsHandler(e)} />
              </p>
              <p>
                <span className="modal-lable">Température d'inflammation: </span>
                <input class="form-control" value={this.state.tempInf} onChange={(e) => this.temperatureHandler(e)} />
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">
                Fermer
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={() => {
                  this.handleSave();
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
