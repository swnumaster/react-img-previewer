# Introduction

    A React component by which you can previewing images easily.
    Demo: https://swnumaster.github.io/react-img-previewer/
    Author: Nathan Jiang (373578963@qq.com)

# Installation

    npm install react-img-previewer

# Usage
```javascript
    import React from 'react';
    import { render } from 'react-dom';
    import ReactImgPreviewer from 'react-img-previewer';

    let imageList = [
        {url: "https://www.fb.com/image1.jpg"},
        {url: "https://www.fb.com/image2.jpg"}
    ];

    const Demo = () => {
        const [preview, setPreview] = useState({display: false, index: 0});

        const onPreviewer = (index) => {
            setPreview({display: true, index: index});
        }

        const onClose = () => {
            setPreview({display: false, index: 0});
        }

        return (
            <React.Fragment>
                <div className='chueasy-previewer-test-wrapper'>
                    <img src={imageList[0].url} onClick={ () => onPreviewer(0) }/>
                    <img src={imageList[1].url} onClick={ () => onPreviewer(1) }/>
                </div>
                { preview.display && <ReactImgPreviewer imageList={imageList} defaultIndex={preview.index} onClose={onClose}/>}
            </React.Fragment>
        );
    }
```

# Change log

    v1.0.1

        ignore unecessary files