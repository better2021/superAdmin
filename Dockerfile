# production environment
FROM nginx
WORKDIR /superAdmin
COPY /dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# 构建镜像 name:tag
# docker build -t xxnamex:1.1 .

# 运行镜像
# docker run -p 3000:80 -d xxnamex:1.1
