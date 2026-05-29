import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动带 Token
http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  err => Promise.reject(err)
)

// 响应拦截：统一解包 / 错误处理
http.interceptors.response.use(
  res => {
    // 后端统一返回 { result, resultCode, data, errorMsg } 结构
    if (res.data?.result !== undefined) {
      if (res.data.result === true) return res.data.data
      return Promise.reject(new Error(res.data.errorMsg || res.data.errorDesc || '接口错误'))
    }
    return res.data
  },
  err => {
    const status = err.response?.status
    const msgMap = {
      401: '登录已过期，请重新登录',
      403: '无权限访问',
      404: '接口不存在',
      500: '服务器内部错误',
    }
    console.error(`[API Error] ${status || 'Network'}: ${err.message}`)
    return Promise.reject(new Error(msgMap[status] || err.message))
  }
)

export default http

