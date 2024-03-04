import React, { Component } from 'react';

class CalculModal extends Component {
    constructor(props) {
        super(props);
        this.handleSave = this.handleSave.bind(this);
        this.state = {
            niv3: '',
            pouvoirE : '',
            longueurF : '',
            tempF : '',
            rayon : '',
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            niv3: nextProps.niv3,
            pouvoirE: nextProps.pouvoirE,
            longueurF : nextProps.longueurF,
            tempF : nextProps.tempF,
            rayon :nextProps.rayon
        });
    }

    nivHandler(e) {
        this.setState({ niv3: e.target.value });
    }

    pouvoirHandler(e) {
        this.setState({ pouvoirE: e.target.value });
    }
    longueurHandler(e) {
        this.setState({ longueurF: e.target.value });
    }
    tempHandler(e) {
        this.setState({ tempF: e.target.value });
    }
    rayonHandler(e) {
        this.setState({ rayon: e.target.value });
    }
    
    handleSave() {
        const item = this.state;
        this.props.saveModalDetails(item)
    }

    render() {
        return (
            <div className="modal fade" id="calculModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Modifier</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><span className="modal-lable">Niveau: </span><input class="form-control" value={this.state.niv3} onChange={(e) => this.nivHandler(e)} /></p>
                            <p><span className="modal-lable">Pouvoir Emissif: </span><input class="form-control" value={this.state.pouvoirE} onChange={(e) => this.pouvoirHandler(e)} /></p>
                            <p><span className="modal-lable">Longueur de Flamme: </span><input class="form-control" value={this.state.longueurF} onChange={(e) => this.longueurHandler(e)} /></p>
                            <p><span className="modal-lable">Température de Flamme: </span><input class="form-control" value={this.state.tempF} onChange={(e) => this.tempHandler(e)} /></p>
                            <p><span className="modal-lable">Rayon: </span><input class="form-control" value={this.state.rayon} onChange={(e) => this.rayonHandler(e)} /></p>
                           </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Fermer</button>
                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => { this.handleSave() }}>Enregistrer</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CalculModal;