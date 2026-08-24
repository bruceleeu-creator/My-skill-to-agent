# 部署模板（按需替换 <app> / <IP> / <端口> / <域名>）

## Nginx vhost（IP 直连路径分发版）

写入 `/www/server/panel/vhost/nginx/<app>-web.conf`：

```nginx
server {
    listen 8080;
    server_name <IP>;
    index index.html;
    root /www/wwwroot/<app>-web;

    client_max_body_size 60m;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    location /admin/ {
        alias /www/wwwroot/<app>-web/admin/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    location /update/ {
        alias /www/wwwroot/<app>-web/update/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

域名版差异：`listen 443 ssl;` + `ssl_certificate`/`ssl_certificate_key` 两行（宝塔面板一键申请 Let's Encrypt 后自动填好），`server_name <域名>;`，另加 80 → 443 跳转的 server 块。

## 后端生产 .env

```ini
PORT=3001
# 前端来源 + null（EXE file:// 页面的 Origin 是字符串 "null"，cors 包按字面匹配）
CORS_ORIGIN=http://<IP>:8080,null
# 管理后台密码：随机生成 ≥8 位，chmod 600，只在交付时告知用户一次
ADMIN_PASSWORD=<随机16位>
# 可选
# DEEPSEEK_API_KEY=sk-真实key
```

随机生成：`tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 16`

## start.sh（pm2 包装器）

```bash
#!/bin/bash
cd "$(dirname "$0")"
exec node --env-file=.env --experimental-sqlite index.js
```

```bash
chmod +x start.sh
pm2 start start.sh --name <app>-server
pm2 save    # 开机自启
```

（`--experimental-sqlite` 仅 Node 22.5–22.12 需要；≥22.13 / ≥24 可去掉）

## crontab（日报 + 备份）

```bash
# 每天 09:00 用户报告（node 用绝对路径）
0 9 * * * cd /www/wwwroot/<app> && /usr/local/bin/node --experimental-sqlite scripts/<report>.mjs >> /www/wwwroot/<app>/reports/cron.log 2>&1

# 每天 03:00 备份数据目录，保留 7 份
0 3 * * * cd /www/wwwroot/<app> && tar -czf /www/backup/<app>-data-$(date +\%F).tar.gz server/data 2>/dev/null; ls -t /www/backup/<app>-data-*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
```

（crontab 里 `%` 要转义成 `\%`）

## CDP 诊断 EXE 渲染（Node 22+ 自带 WebSocket）

```bash
./<app>.exe --remote-debugging-port=9223   # 9222 常被占
node scripts/cdp-diagnose.mjs              # 见被部署项目 scripts/ 目录
```

诊断要点：`/json/list` 找 page target → `Runtime.evaluate` 依次查：
`document.getElementById('root').innerHTML.length`（有没有渲染）、
`document.styleSheets`（CSS 生效没）、`document.body.innerText`（渲染了什么）、
最后 `Page.captureScreenshot` 出内部真图。

## 防火墙放行指引（发给用户的字段表）

| 字段 | 值 |
|---|---|
| 应用类型 | 自定义 |
| 协议 | TCP |
| 端口 | 8080（按实际） |
| 来源 | 0.0.0.0/0 |
| 策略 | 允许 |

位置：腾讯云控制台 → 轻量应用服务器 → 实例详情 → 防火墙 → 添加规则。
