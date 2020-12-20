import axios from "axios"
import router from "/@/router/index"
import store from "/@/store/index"

// 请求超时时间
axios.defaults.timeout = 10000
// post请求头
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"

console.log(process.env.NODE_ENV)
// 环境的切换,请求域名跟着切换
if (process.env.NODE_ENV === "development") {
    axios.defaults.baseURL = "http://127.0.0.1:8081"
} else if (process.env.NODE_ENV === "production") {
    axios.defaults.baseURL = "http://127.0.0.1:8081"
} else {
    axios.defaults.baseURL = "http://127.0.0.1:8081"
}

// 请求拦截
axios.interceptors.request.use(
    (config) => {
        const token = store.getters.token
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        const response = error.data
        response.status = error.response.status
        return response
    }
)

// 响应拦截器
axios.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return Promise.resolve(response.data)
        } else {
            return Promise.reject(response.data)
        }
    },
    // 服务器状态码不是200的情况
    (error) => {
        if (error.response.status) {
            switch (error.response.status) {
                // 401: 未登录
                // 未登录则跳转登录页面，并携带当前页面的路径
                // 在登录成功后返回当前页面，这一步需要在登录页操作。
                case 401:
                    // 退出登录
                    store.dispatch("loginOut")
                    console.log("登录过期，请重新登录")
                    // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                    setTimeout(() => {
                        router.replace({
                            path: "/login",
                            query: { redirect: router.currentRoute.fullPath },
                        })
                    }, 500)
                    break
                // 404请求不存在
                case 404:
                    console.log("网络请求资源不存在")
                    break
                // 500服务器错误
                case 500:
                    console.log("服务器错误-500")
                    break
                // 其他错误，直接抛出错误提示
                default:
                    console.log(error.response.data.msg)
            }
            return Promise.reject(error.response)
        }
    }
)

export default axios
