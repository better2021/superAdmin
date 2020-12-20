import Cookies from "js-cookie"

const TokenKey = "token"

function getToken() {
    return Cookies.get(TokenKey)
}

function setToken(token) {
    return Cookies.set(TokenKey, token, { expires: 3 }) // 设置token过期时间为3天
}

function removeToken() {
    return Cookies.remove(TokenKey)
}

export { getToken, setToken, removeToken }
