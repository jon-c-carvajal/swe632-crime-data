import React, { Component } from 'react';
import Modal from 'react-modal';
import './SideModal.css';
const customStyles = {
  content : {

   // transform             : 'translate(50%, 0%)'
  }
  
};

class SideModal extends Component {
  constructor(props) {
    super(props);
    this.props.container.modal=this;
    this.state = {
      showModal: false
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show(){
    this.setState({
      showModal: true,
    });
  };

  hide(){
    this.setState({
      showModal: false,
    });
  };  

  

  render() {
    return (
      <Modal
      isOpen={this.state.showModal}
      contentLabel="Example Modal"
      animation="slideLeft"
      onRequestClose={this.hide}
      shouldCloseOnOverlayClick={true}
      style={{}}   >
    </Modal>

    );
  }
}

export default SideModal;
