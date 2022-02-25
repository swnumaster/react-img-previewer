import React, { useEffect } from 'react';
import './static/css/style.css';
import defaultImage from './static/images/image.svg'   // should import image.svg first to use it in this component
import { openImagePreviewer, closeImagePreviewer } from './preview';

const ReactImgPreviewer = (props) => {
    
    const { imageList, defaultIndex, onClose } = props;

    useEffect(() => {
        openImagePreviewer(imageList, defaultIndex, defaultImage);
    }, []);

    const handleClose = () => {
        closeImagePreviewer();
        onClose();
    }

    return (
        <React.Fragment>
            <section className="chueasy-previewer-wrapper">
                <img src="" />
                <div className="btn-close" onClick={handleClose}></div>
            </section>
        </React.Fragment>
    );
}

export default ReactImgPreviewer;

