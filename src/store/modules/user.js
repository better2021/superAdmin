import { getToken, setToken, removeToken } from "/@/utils/cookie"

let userInfo = window.localStorage.getItem("userInfo")

const user = {
    state: () => ({
        token: getToken(),
        userInfo: userInfo ? JSON.parse(userInfo) : {},
    }),
    // mutations 中的方法是同步方法
    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
            setToken(token)
        },
        SET_USERINFO(state, userInfo) {
            state.userInfo = userInfo
            window.localStorage.setItem("userInfo", JSON.stringify(userInfo))
        },
        LOGIN_OUT(state) {
            state.token = ""
            state.userInfo = {}
            removeToken()
            window.localStorage.removeItem("userInfo")
        },
    },
    // actions 中的方法是异步方法
    actions: {
        // 用户登录
        login({ commit }, payload) {
            commit("SET_TOKEN", payload.token)
            commit("SET_USERINFO", payload)
        },
        // 用户退出
        loginOut({ commit }) {
            commit("LOGIN_OUT")
        },
    },
}

export default user
