import axios from 'axios'

// 时间戳
var time_to_ago = null

//自动加在url前面
axios.defaults.baseURL = 'https://api.qixin.com/APIService'
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";

//超时时间 
axios.defaults.timeout = 5000
//跨域凭证
axios.defaults.withCredentials = false

axios.interceptors.request.use(config => {
  let timestamp = new Date().getTime()
  if (time_to_ago && timestamp - time_to_ago >= 100000 || !time_to_ago) {
    time_to_ago = timestamp
  }
  //部分接口需要token
  let token = localStorage.getItem('token');
  if(token) {
    config.headers.token = token;
    // config.headers ={
      // 'token':token
    // }
  }
    config.headers ={
      'Auth-Version': '2.0',
      'appkey': '',
      'timestamp': timestamp,
      'sign': ''
    }
  return config;
},err => {
  return Promise.reject(err)
})
 
//拦截器  -响应拦截
axios.interceptors.response.use(res => {
  if(res.data.code === 2000) {
    return Promise.resolve(res.data)
  } else{
    return Promise.reject(res.data)
  }
}, err => {
  return Promise.reject(err)
});
 
//整体导出
export default axios;