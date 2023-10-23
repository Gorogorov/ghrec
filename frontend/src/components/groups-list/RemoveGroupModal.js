import React from 'react';
import Modal from 'react-modal';

function RemoveGroupModal(props) {
    const {title, msg, modalOnClose, modalIsOpen, modalOnRemove} = props;

    const modalStyles = {
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#f1f1f1",
        },
        overlay: {
            backgroundColor: "rgba(140, 140, 140, 0.3)",
        },
    };

    return (
    <Modal  isOpen={modalIsOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={modalOnClose}
            style={modalStyles}
            contentLabel="Modal remove group"
    >
        <div className="modal-rmg-header d-flex justify-content-between">
            <h5 className="modal-rmg-title m-0">
                {title}
            </h5>
            <div className="modal-rmg-close">
                <button type="button"
                        className="modal-rmg-close-times btn btn-close shadow-none"
                        aria-label="Close"
                        onClick={modalOnClose}>        
                </button>
            </div>
        </div>
        <p className="modal-rmg-close-msg">
            {msg}
        </p>
        <div className="d-flex justify-content-between mx-2">
            <input  className="modal-rmg-ok-btn btn btn-primary btn-dark"
                    type="button"
                    value="Delete"
                    onClick={modalOnRemove}/>
            <input  className="modal-rmg-close-btn btn btn-primary btn-dark"
                    type="button"
                    value="Close"
                    onClick={modalOnClose}/>
        </div>
    </Modal>
    )
}

export default RemoveGroupModal;