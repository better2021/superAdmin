/**
 * vue3.x router
 * 引入为分模块引入
 * hidden: false 表示会在菜单上显示，否则不会
 */

import { createWebHistory, createRouter } from "vue-router"

const routes = [
    {
        path: "/",
        name: "首页",
        icon: "el-icon-menu",
        component: () => import("/@/views/Home/index.vue"),
        hidden: false,
    },
    {
        path: "/login",
        name: "登录",
        icon: "el-icon-document",
        component: () => import("/@/views/Login/index.vue"),
        hidden: true,
    },
    {
        path: "/register",
        name: "注册",
        icon: "el-icon-setting",
        component: () => import("/@/views/Register/index.vue"),
        hidden: true,
    },
    {
        path: "/film",
        name: "电影",
        icon: "el-icon-film",
        component: () => import("/@/views/Film/index.vue"),
        hidden: false,
    },
    {
        path: "/book",
        name: "书籍",
        icon: "el-icon-notebook-2",
        component: () => import("/@/views/Book/index.vue"),
        hidden: false,
    },
    {
        path: "/music",
        name: "音乐",
        icon: "el-icon-headset",
        component: () => import("/@/views/Music/index.vue"),
        hidden: false,
    },
    {
        path: "/note",
        name: "空间",
        icon: "el-icon-notebook-1",
        component: () => import("/@/views/Note/index.vue"),
        hidden: false,
    },
    // 404 页面
    {
        path: "/:catchAll(.*)",
        name: "404页面",
        icon: "el-icon-setting",
        component: () => import("/@/views/NotFound.vue"),
        hidden: true,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ y: 0 }),
})

export default router
