var document = window.document;
var supportFeatures = {
    transform3d: ("WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix()),
    onTouchStart: ("ontouchstart" in window)
};

// function getTranslate(tranX, tranY){
//     return supportFeatures.transform3d ? "translate3d("+ tranX +"px, "+ tranY +"px, 0)" : "translate("+ tranX +"px, "+ tranY +"px)";
// }

function getPos(e) {
    if (supportFeatures.onTouchStart && e.changedTouches != undefined) {
        return { x: e.changedTouches[0]["pageX"], y: e.changedTouches[0]["pageY"] };
    }
    return { x: e["pageX"], y: e["pageY"] };
}

// get the postion of double points
function getDoublePos(e) {
    return {
        x1: e.touches[0].pageX,
        y1: e.touches[0].pageY - document.body.scrollTop,
        x2: e.touches[1].pageX,
        y2: e.touches[1].pageY - document.body.scrollTop
    };
}

// get the direction of the mouse wheel
function isMouseWheelUp(e) {
    // window.event: 在ie下，事件对象是全局的，作为window的一个属性。event在其他浏览器中作为方法的第一个参数传入
    e = e || window.event;  // 或 if (!e) e = window.event;

    var delta = 0;
    if (e.wheelDelta) { //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
        delta = e.wheelDelta / 120; 
        if (window.opera) delta = -delta;   //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
    } else if (e.detail) {  //FF浏览器使用的是detail,其值为“正负3”
        delta = -e.detail / 3;
    }
    return delta > 0;
}

// function setTransform(element, moveX, moveY, duration="0s", timingFunc="ease") {
//     element.style.webkitTransitionProperty = "-webkit-transform";
//     element.style.webkitTransitionDuration = duration;
//     element.style.webkitTransitionTimingFunction = timingFunc;
//     element.style.webkitTransform = getTranslate(moveX, moveY);
// }

function setPosition(element, left, top) {
    element.style.left = left + "px";
    element.style.top = top + "px";
}

function getPosition(element) {
    return { x: element.offsetLeft, y: element.offsetTop };
}

function setSize(element, width, height) {
    element.style.width = width === "100%" ? width : width + "px";
    element.style.height = height === "100%" ? height : height + "px";
}

function getSize(element) {
    return { w: element.offsetWidth, h: element.offsetHeight };
}

function preventDefaultEventAndCancelBubble(e) {
    e = e || window.event;  // 这一句其实必要性不大了，因为目前Chrome,Firefox, IE, Edge等浏览器几乎都支持了event和window.event
    e.preventDefault(); // 取消事件的默认动作
    e.stopPropagation(); // 阻止JS事件冒泡传递
}

// 取坐标点之间的距离和中点坐标
function getPivotPoint(doublePos) {
    return {
        length: Math.round(Math.sqrt(Math.pow(doublePos.x1 - doublePos.x2, 2) + Math.pow(doublePos.y1 - doublePos.y2, 2))),
        x: Math.round((doublePos.x1 + doublePos.x2) /2),
        y: Math.round((doublePos.y1 + doublePos.y2) /2),
    }
}

function debugInfo(enable, ...args) {
    if(enable) console.log(args);
}


var ImagePreviewer = function() {};  // 如果用ImagesZoom创建对象，那么这个function(){}就相当于构造函数

ImagePreviewer.prototype = {    // 在构造器函数外，只能通过prototype向对象添加属性或方法

    open: function(imgList, defaultIndex, defaultImage) {
        // image data
        this.m_imgList = imgList;
        this.m_defaultIndex = defaultIndex;
        this.m_defaultImage = defaultImage;
        this.m_imageIndex = -1;
        // configures
        this.m_switchEnable = false; // 开启后，才能滑动切换图片
        this.m_zoomStep = 0.2; // 图片缩放的步进
        this.m_buffMove = 4; // 缓冲系数
        this.m_switchImageBuff = 10; // 手指滑动多少个像素，才切换图片
        this.m_maxZoomRatio = 10; // 图片可放大的最大倍数
        this.m_enableDebug = false;
        // get elements
        this.m_eWrapper = document.querySelector(".chueasy-previewer-wrapper");
        this.m_eImg = document.querySelector(".chueasy-previewer-wrapper img");
        this.m_eBtnClose = document.querySelector(".chueasy-previewer-wrapper .btn-close");

        this.bindEvent();   // 放到此处是避免重复调用导致多次绑定

        this.load(this.m_defaultIndex);
    },

    close: function() {
        this.enableScroll();
    },

    load: function(index) {
        var self = this;
        // if index is not changed, do nothing
        if (index === self.m_imageIndex)
            return;
        
        var imgUrl = "";
        if (index < 0 || index >= self.m_imgList.length) {
            return;
        } else {
            if (self.m_imgList[index].url != undefined)
                imgUrl = self.m_imgList[index].url;
            else
                imgUrl = self.m_defaultImage;
        }

        self.m_imageIndex = index;
        self.m_eImg.src = imgUrl;   // load the image
        self.m_eImg.onload = function() {
            self.reset();
        }
    },

    bindEvent: function() {
        var self = this;
        // bind handling functions to events
        window.addEventListener('resize', function(e) { self.handleResize(e); }, false);    // 窗口大小变化事件

        self.disableScroll(); // 当previewer打开时，禁止下层的内容滚动

        self.m_eImg.addEventListener("touchstart", function(e) { self.handleTouchStart(e); }, false);
        self.m_eImg.addEventListener("touchmove", function(e) { self.handleTouchMove(e); }, false);
        self.m_eImg.addEventListener("touchend", function(e) { self.handleTouchEnd(e); }, false);
        
        self.m_eImg.addEventListener('mousedown', function(e) { self.handleMouseDown(e); }, false);
        self.m_eImg.addEventListener('mousemove', function(e) { self.handleMouseMove(e); }, false);
        self.m_eImg.addEventListener('mouseup', function(e) { self.handleMouseUp(e); }, false);
        self.m_eImg.addEventListener('mouseout', function(e) { self.handleMouseOut(e); }, false);
        self.m_eImg.addEventListener('DOMMouseScroll', function(e) { self.handleMouseZoom(e); }, false);    // Firefox
        self.m_eImg.addEventListener('mousewheel', function(e) { self.handleMouseZoom(e); }, false); // Chrome
    },

    disableScroll: function() {
        document.body.style.overflow = 'hidden'
        // { passive: false }解决下面问题：
        //      [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
        document.addEventListener("touchmove", preventDefaultEventAndCancelBubble, { passive: false }); // 禁止页面滚动
        document.addEventListener('mousemove', preventDefaultEventAndCancelBubble, false); // 禁止页面滚动
        document.addEventListener('mousewheel', preventDefaultEventAndCancelBubble, { passive: false }); // 禁止页面滚动
    },

    enableScroll: function() {
        document.body.style.overflow = ''
        document.removeEventListener("touchmove", preventDefaultEventAndCancelBubble, false); // 禁止页面滚动
        document.removeEventListener('mousemove', preventDefaultEventAndCancelBubble, false); // 禁止页面滚动 
        document.removeEventListener('mousewheel', preventDefaultEventAndCancelBubble, { passive: false }); // 禁止页面滚动
    },
 
    reset: function() {
        this.m_wrapperPos = getPosition(this.m_eWrapper); // Wrapper坐标 (0，0)
        this.m_wrapperSize = getSize(this.m_eWrapper); // Wrapper尺寸（实际就是屏幕尺寸）
        this.m_wrapperDiagonalLength = Math.round(Math.sqrt(Math.pow(this.m_wrapperSize.w, 2) + Math.pow(this.m_wrapperSize.h, 2)));
        this.initImage();
        this.m_imgInitialSize = getSize(this.m_eImg);
        this.m_imgPos = getPosition(this.m_eImg);
        this.m_isMouseDown = false;
    },

    initImage: function() {
        var width = 0;
        var height = 0;
        var left = 0;
        var top = 0;
        var wrapperRatio = this.m_wrapperSize.w / this.m_wrapperSize.h;
        var imgRatio = this.m_eImg.naturalWidth / this.m_eImg.naturalHeight;
        if (wrapperRatio < imgRatio) {
            width = this.m_wrapperSize.w;
            height = Math.round(width / imgRatio);
            top = (this.m_wrapperSize.h - height) / 2;
        } else {
            height = this.m_wrapperSize.h;
            width = height * imgRatio;
            left = (this.m_wrapperSize.w - width) / 2;
        }

        debugInfo(this.m_enableDebug, "naturalSize:", this.m_eImg.naturalWidth, this.m_eImg.naturalHeight, "initSize:", width, height);

        setSize(this.m_eImg, width, height);
        setPosition(this.m_eImg, left, top);
    },

    zoomImage: function(zoomRatio, pivotPos) {
        var imgSize = getSize(this.m_eImg);
        var imgPos = getPosition(this.m_eImg);

        debugInfo(this.m_enableDebug, "Before zoom: ", imgSize.w, imgSize.h);

        // calculate the image new size by the ratio
        var newWidth = imgSize.w * zoomRatio;
        var newHeight = imgSize.h * zoomRatio;
        // the image size cannot be smaller than the initial size
        if (newWidth < this.m_imgInitialSize.w) newWidth = this.m_imgInitialSize.w;
        if (newHeight < this.m_imgInitialSize.h) newHeight = this.m_imgInitialSize.h;
        
        // check zoom ratio is valid or not
        var currRatio = newWidth / this.m_imgInitialSize.w;
        if (currRatio > this.m_maxZoomRatio) return;

        // the length of the left part of the pivot point
        var pivotLeft = pivotPos.x - imgPos.x;
        var newPivotLeft = Math.round(newWidth * pivotLeft / imgSize.w);
        // the length of the top part of the pivot point
        var pivotTop = pivotPos.y - imgPos.y;
        var newPivotTop = Math.round(newHeight * pivotTop / imgSize.h);
        // calculate the image new position
        var newPosX = pivotPos.x - newPivotLeft;
        var newPosY = pivotPos.y - newPivotTop;
        
        // adjust the image new position to make it fit for the wrapper
        var newPos = this.adjustPosition(newPosX, newPosY, newWidth, newHeight);

        debugInfo(this.m_enableDebug, "After zoom: ", newWidth, newHeight);

        setSize(this.m_eImg, newWidth, newHeight);
        setPosition(this.m_eImg, newPos.x, newPos.y);
    },

    moveImage: function(startPoint, endPoint) {
        var imgSize = getSize(this.m_eImg);
        var imgPos = getPosition(this.m_eImg);
        var newPosX = imgPos.x + (endPoint.x - startPoint.x);
        var newPosY = imgPos.y + (endPoint.y - startPoint.y);

        // if the image is initial size, cannot move it
        if (imgSize.w === this.m_imgInitialSize.w && imgSize.h === this.m_imgInitialSize.h) {
            return;
        }
        
        // adjust the image new position to make it fit for the wrapper
        var newPos = this.adjustPosition(newPosX, newPosY, imgSize.w, imgSize.h);
        setPosition(this.m_eImg, newPos.x, newPos.y);
    },

    adjustPosition: function(newPosX, newPosY, newWidth, newHeight) {
        if (newWidth <= this.m_wrapperSize.w) {
            newPosX = Math.round((this.m_wrapperSize.w - newWidth) / 2);
        } else {
            if (newPosX > this.m_wrapperPos.x)
                newPosX = this.m_wrapperPos.x;
            if ((newPosX + newWidth) <  (this.m_wrapperPos.x + this.m_wrapperSize.w))
                newPosX = this.m_wrapperPos.x - (newWidth - this.m_wrapperSize.w);
        }
        if (newHeight <= this.m_wrapperSize.h) {
            newPosY = Math.round((this.m_wrapperSize.h - newHeight) / 2);
        } else {
            if (newPosY > this.m_wrapperPos.y)
            newPosY = this.m_wrapperPos.y;
            if ((newPosY + newHeight) <  (this.m_wrapperPos.y + this.m_wrapperSize.h))
                newPosY = this.m_wrapperPos.y - (newHeight - this.m_wrapperSize.h);          
        }
        return { x: newPosX, y: newPosY };
    },

    switchImage: function(startPoint, endPoint) {
        if (!this.m_switchEnable) return;

        // if the image is initial size, cannot move it
        var imgSize = getSize(this.m_eImg);
        if (imgSize.w === this.m_imgInitialSize.w && imgSize.h === this.m_imgInitialSize.h) {
            if (endPoint.x > startPoint.x && 
                (endPoint.x - startPoint.x) > Math.abs(endPoint.y - startPoint.y) * 2 &&
                (endPoint.x - startPoint.x) > this.m_switchImageBuff) {
                this.load(this.m_imageIndex - 1);
            } else if (startPoint.x > endPoint.x && 
                (startPoint.x - endPoint.x) > Math.abs(startPoint.y - endPoint.y) * 2 &&
                (startPoint.x - endPoint.x) > this.m_switchImageBuff) {
                this.load(this.m_imageIndex + 1);
            }
        }
    },

    handleResize: function(e) {
        this.reset();
    },

    handleTouchStart: function(e) {
        debugInfo(this.m_enableDebug, "handleTouchStart...", e.target);
        var self = this;
        e.preventDefault();

        if (e.targetTouches.length > 1) {   // 缩放（多个手指操作）
            var doublePos = getDoublePos(e);
            self.m_pivotPos = getPivotPoint(doublePos);
        } else {
            this.m_switchImageEnable = true;
            this.m_startPointPos = getPos(e);   // just for switching a image
            this.m_pointPos = getPos(e);
        }
    },

    handleTouchMove: function(e) {
        debugInfo(this.m_enableDebug, "handleTouchMove...", e.target);
        var self = this;
        e.preventDefault();
        e.stopPropagation();

        if (e.targetTouches.length > 1) {   // 缩放（多个手指操作）
            var doublePos = getDoublePos(e);
            var currPivotPos = getPivotPoint(doublePos);
            var moveLength = currPivotPos.length - self.m_pivotPos.length;
            var pivotPos = { x: currPivotPos.x, y: currPivotPos.y };
            var zoomRatio = (self.m_wrapperDiagonalLength + moveLength * self.m_buffMove) / self.m_wrapperDiagonalLength;    // 计算缩放倍率
            self.m_pivotPos = currPivotPos;
            if (zoomRatio === 1.0) return;
            self.zoomImage(zoomRatio, pivotPos);
        } else {
            var startPoint = this.m_pointPos;
            var endPoint = getPos(e);
            this.m_pointPos = { x: endPoint.x, y: endPoint.y };
            this.moveImage(startPoint, endPoint);
        }
    },

    handleTouchEnd: function(e) {
        debugInfo(this.m_enableDebug, "handleTouchEnd...", e.target);
        if (this.m_switchImageEnable) {
            this.switchImage(this.m_startPointPos, getPos(e));
            this.m_switchImageEnable = false;
        }
    },

    handleMouseDown: function(e) {
        debugInfo(this.m_enableDebug, "handleMouseDown...", e.target);
        e.preventDefault(); // Firefox下这是必须的，否则鼠标按下默认动作会在新tab页打开图片
        this.m_startPointPos = getPos(e);   // just for switching a image
        this.m_pointPos = getPos(e);
        this.m_isMouseDown = true;
    },

    handleMouseMove: function(e) {
        // debugInfo(this.m_enableDebug, "handleMouseMove...", e.target);
        if (!this.m_isMouseDown) return;
        e.preventDefault();
        e.stopPropagation();
        var startPoint = this.m_pointPos;
        var endPoint = getPos(e);
        this.m_pointPos = { x: endPoint.x, y: endPoint.y };
        this.moveImage(startPoint, endPoint);
    },

    handleMouseUp: function(e) {
        debugInfo(this.m_enableDebug, "handleMouseUp...", e.target);
        this.m_isMouseDown = false;
        this.switchImage(this.m_startPointPos, getPos(e));
    },

    handleMouseOut: function(e) {
        // debugInfo(this.m_enableDebug, "handleMouseOut...", e.target);
        this.m_isMouseDown = false;
    },    

    handleMouseZoom: function(e) {
        debugInfo(this.m_enableDebug, "handleMouseZoom...", e.target);
        var pivotPos = getPos(e);    // 图片缩放的支点
        var zoomRatio = isMouseWheelUp(e) ? (1 + this.m_zoomStep) : (1 - this.m_zoomStep)    // 计算缩放倍率
        this.zoomImage(zoomRatio, pivotPos);
    },
};

var imagePreviewer = new ImagePreviewer();

export const openImagePreviewer = (imgList, defaultIndex, defaultImage) => {
    imagePreviewer.open(imgList, defaultIndex, defaultImage);
}

export const closeImagePreviewer = () => {
    imagePreviewer.close();
}