/**
 * 相当于qs，把对象转换为字符串a=1&b=3 的形式
 * @param {*} obj
 */
const fromData = (obj) => {
    let arr = []

    for (let key in obj) {
        arr.push(`${key}=${encodeURIComponent(obj[key])}`)
    }
    return arr.join("&")
}

/**
 * 时间格式过滤
 * @param {*} time
 * time 单位为秒的时间戳
 */

function getFormatDate(time) {
    const d = +new Date(time)
    const now = Date.now()
    const diff = (now - d) / 1000

    if (diff < 30) {
        return "刚刚"
    } else if (diff < 3600) {
        // less 1 hour
        return Math.ceil(diff / 60) + "分钟前"
    } else if (diff < 3600 * 24) {
        return Math.ceil(diff / 3600) + "小时前"
    } else if (diff < 3600 * 24 * 2) {
        return "1天前"
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`
}

export { fromData, getFormatDate }
