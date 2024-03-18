/**
 * 全屏 toggleFullScreen
 * 保存 downloadImpByChart
 */
let _isFullscreen = true
export default function() {
  const downloadSvgFn = (svg, width, height, chartName, rootName) => {
    var serializer = new XMLSerializer()
    var source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg)
    var image = new Image()
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
    image.onload = function () {
      var canvas = document.createElement('canvas')
      canvas.width = width + 40;
      canvas.height = height + 40;
      var context = canvas.getContext('2d');
      context.rect(0, 0, width + 40, height + 40);
      context.fillStyle = '#fff';
      context.fill();
      context.drawImage(image, 20, 20);
      var url = canvas.toDataURL("image/png");
      var a = document.createElement("a");
      a.download = chartName + '-' + rootName + ".png";
      a.href = url;
      a.click();
      return
    }
  }
  const downloadImpByChart = (chartName, rootName, zoomClassName = '') => {
    //得到svg的真实大小
    let box = document.querySelector('svg').getBBox(),
      x = box.x,
      y = box.y,
      width = box.width,
      height = box.height;
    if (zoomClassName) {
      //查找zoomObj
      var zoomObj = svg.getElementsByClassName(zoomClassName.replace(/\./g, ''))[0];
      if (!zoomObj) {
        return false;
      }
      /*------这里是处理svg缩放的--------*/
      var transformMath = zoomObj.getAttribute('transform'),
        scaleMath = zoomObj.getAttribute('transform');
      if (transformMath || scaleMath) {
        var transformObj = transformMath.match(/translate\(([^,]*),([^,)]*)\)/),
          scaleObj = scaleMath.match(/scale\((.*)\)/);
        if (transformObj || scaleObj) { //匹配到缩放
          var translateX = transformObj[1],
            translateY = transformObj[2],
            scale = scaleObj[1];
          x = (x - translateX) / scale;
          y = (y - translateY) / scale;
          width = width / scale;
          height = height / scale;
        }
      }
    }
    //克隆svg
    var node = svg.cloneNode(true);
    //重新设置svg的width,height,viewbox
    node.setAttribute('width', width);
    node.setAttribute('height', height);
    node.setAttribute('viewBox', [x, y, width, height]);
    if (zoomClassName) {
      var zoomObj = node.getElementsByClassName(zoomClassName.replace(/\./g, ''))[0];
      /*-------------清楚缩放元素的缩放-------------*/
      zoomObj.setAttribute('transform', 'translate(0,0) scale(1)');
    }
    downloadSvgFn(node, width, height, chartName, rootName);
  }
  const checkFull = () => {
    var isFull =
      document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled
    if (isFull === undefined) {
      isFull = false
    }
    return isFull
  }
  const FullScreen = (isFullscreen, el = document.documentElement) => {
    if (isFullscreen) {
      //退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (!document.msRequestFullscreen) {
        document.msExitFullscreen()
      }
    } else {
      //进入全屏
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
      } else if (el.webkitRequestFullscreen) {
        //改变平面图在google浏览器上面的样式问题
        el.webkitRequestFullscreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
    }
  }
  const toggleFullScreen = (el = 'app') => {
    _isFullscreen = !_isFullscreen
    FullScreen(_isFullscreen, document.getElementById(el) )
  }
  return { toggleFullScreen, downloadImpByChart, FullScreen, downloadSvgFn }
}