import React, { useState } from 'react';
import { render } from 'react-dom';
import ReactImgPreviewer from '../../src';

// 以下为Demo部分数据配置和组件使用方式
var imgUrl1 = require('../../src/static/images/slide1.jpg');    // 模块化方式引用图片路径，这样引用的图片才可以打包进dist文件夹
var imgUrl2 = require('../../src/static/images/slide2.jpg');
var imgUrl3 = require('../../src/static/images/slide3.jpg');

let imageList = [
    {url: imgUrl1},
    {url: imgUrl2},
    {url: imgUrl3}
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
                <img src={imageList[2].url} onClick={ () => onPreviewer(2) }/>
                <img src={imageList[0].url} onClick={ () => onPreviewer(0) }/>
                <img src={imageList[1].url} onClick={ () => onPreviewer(1) }/>
                <img src={imageList[2].url} onClick={ () => onPreviewer(2) }/>                
            </div>
            { preview.display && <ReactImgPreviewer imageList={imageList} defaultIndex={preview.index} onClose={onClose}/>}
        </React.Fragment>
    );
}
//

var packageJson = require('../../package.json');

const App = () => {
    return (
        <React.Fragment>
            <div className="chueasy-header-wrapper">
                <h2>{packageJson.name} (V{packageJson.version})</h2>
                <p>Author: {packageJson.author}</p>
                <p>E-mail: {packageJson.email}</p>
            </div>
            <Demo />
        </React.Fragment>
    );
};

render(<App />, document.getElementById("root"));