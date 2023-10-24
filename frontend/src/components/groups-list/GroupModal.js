import React from 'react';
import Modal from 'react-modal';

function GroupModal(props) {
    const {title, msg, modalOnClose, modalIsOpen,
        modalOnSubmit, modalBtnValue} = props;
    Modal.setAppElement('#root');

    const modalStyles = {
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#f1f1f1",
          width: "25rem",
        },
        overlay: {
            backgroundColor: "rgba(140, 140, 140, 0.3)",
        },
    };

    return (
    <Modal  isOpen={modalIsOpen}
            onRequestClose={modalOnClose}
            style={modalStyles}
    >
        <div className="modal-header d-flex justify-content-between mb-3">
            <h5 className="modal-title m-0">
                {title}
            </h5>
            <div className="modal-close-times">
                <button type="button"
                        className="modal-close-times-btn btn btn-close shadow-none"
                        aria-label="Close"
                        onClick={modalOnClose}>        
                </button>
            </div>
        </div>
        {msg}
        <div className="d-flex justify-content-between">
            <input  className="modal-ok-btn btn btn-primary btn-dark col-4"
                    type="button"
                    value={modalBtnValue}
                    onClick={modalOnSubmit}/>
            <input  className="modal-close-btn btn btn-primary btn-dark opacity-50 col-4"
                    type="button"
                    value="Close"
                    onClick={modalOnClose}/>
        </div>
    </Modal>
    );
}

export default GroupModal;