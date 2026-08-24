---
name: tencent-lighthouse-deploy
description: 把 Node/React/Electron 全栈项目部署到腾讯云轻量服务器（宝塔面板）的完整方法论：SSH 准入、环境侦察、pm2 常驻、Nginx 路径分发、防火墙、冒烟验证、定时任务、一键发布，以及实战踩过的全部坑（node:sqlite 标志位、pm2 转义、端口被占、scp 子目录、EXE file:// 白屏、镜像推 GitHub 等）。用户提到「部署到服务器 / 上线 / 腾讯云 / 轻量服务器 / 宝塔 / 挂到服务器 / 发布上线」等任何服务器部署意图时使用本技能；部署前先读 references/pitfalls.md 避坑。
---

# 腾讯云轻量 + 宝塔 部署方法论（实战固化版）

来源：2026-08-15 一次真实部署（Node/Express/node:sqlite 后端 + React/Vite 前端 + Electron EXE + 管理后台，IP 直连无域名模式），全部步骤与坑都经过实跑验证。

## 核心原则（先读）

1. **服务器上可能跑着用户的其他服务**（pm2 进程、docker 容器、其他人的 80 端口）——动手前先侦察，绝不干扰现有服务；端口冲突就换端口（如 8080），不要抢。
2. **轻量云的防火墙在腾讯云控制台，不在服务器里**（服务器上看不到 iptables 规则）——端口放行必须用户在控制台操作，提前把「需要放行哪些端口」一次性告诉用户。
3. **无域名 = 无 HTTPS**（证书机构不给裸 IP 发证）。IP 直连模式可接受（明文传输），上域名是配置文件三处替换 + 重发布的成本，架构上要预留。
4. IP 直连模式的推荐拓扑（单端口路径分发，不依赖子域名）：

```
http://IP:8080/        → 网页版静态文件（前端 dist）
http://IP:8080/admin/  → 管理后台静态文件
http://IP:8080/api/    → Nginx 反代 → Node 后端（127.0.0.1:3001，不对外）
http://IP:8080/update/ → EXE 自动更新源（latest.yml + 安装包）
```

5. 动手前先读 `references/pitfalls.md`（按踩坑时间整理），模板文件在 `references/templates.md`。

## 阶段 0：SSH 准入

最快路径（用户无密码交互、本机无 plink/sshpass 时唯一路径）：**让用户在腾讯云控制台 → 实例详情 → 「登录」（OrcaTerm 网页终端，root 身份免密）粘贴一条加公钥命令**：

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '<公钥内容>' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✓ 公钥添加成功"
```

本机先 `ssh-keygen -t ed25519 -N "" -f ~/.ssh/<专用密钥名>` 生成专用密钥对。备选：宝塔面板网页终端（若用户能给面板地址+账号，可用浏览器自动化进去贴命令）；root 密码在非交互终端**不可用**（无 sshpass 时无法输入）。

## 阶段 1：环境侦察（一条 SSH 拿全）

```bash
ssh -i ~/.ssh/<key> root@<IP> 'uname -m; grep PRETTY /etc/os-release
ls /www/server/nginx/sbin/nginx && /www/server/nginx/sbin/nginx -v
command -v node && node -v; command -v pm2 && pm2 -v
ss -tlnp | grep -E ":(80|443|8080|3001) "    # 端口被谁占，重点看 80！
docker ps                                     # 现有容器清单
df -h / | tail -1'
```

判定：
- 有宝塔 nginx（/www/server/nginx）→ 用它的 vhost 目录 `/www/server/panel/vhost/nginx/*.conf`
- Node ≥ 22.13 → node:sqlite 直接用；**22.5–22.12 必须加 `--experimental-sqlite`**（本地新版 Node 无感，服务器旧版必报 `ERR_UNKNOWN_BUILTIN_MODULE`）
- **80 被非 nginx 进程占用** → 别动它，应用换端口（如 8080），并让用户在控制台放行该端口
- 同时列出现有 vhost conf，凡 `listen 80` 的（含宝塔自带 phpfpm_status.conf）在起 nginx 前改 `.bak`

## 阶段 2：部署后端

```bash
# 目录规划
/www/wwwroot/<app>/server          # 后端代码
/www/wwwroot/<app>/scripts         # 运维脚本（日报等）
/www/wwwroot/<app>-web/            # 静态站点根（前端 dist）
/www/wwwroot/<app>-web/admin/      # 管理后台 dist
/www/wwwroot/<app>-web/update/     # EXE 更新包
```

1. `scp` 上传后端代码（仅业务 js + package.json，**排除 node_modules / data 目录**）
2. `npm install --omit=dev --registry=https://registry.npmmirror.com`
3. 写生产 `.env`（模板见 references/templates.md）：PORT、`CORS_ORIGIN=http://IP:端口,null`（null 是 EXE file:// 页面的 Origin，cors 包按字符串匹配）、随机生成的 `ADMIN_PASSWORD`（≥8 位，chmod 600 .env，只在交付时告知用户一次）
4. **写 start.sh 包装器再交给 pm2**（不要用 pm2 的 --node-args 传 `--env-file=.env` 这类参数，经 SSH 转义必坏）：

```bash
#!/bin/bash
cd "$(dirname "$0")"
exec node --env-file=.env --experimental-sqlite index.js
```

```bash
pm2 start start.sh --name <app>-server && pm2 save
curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:3001/api/auth/login  # 4xx=通
```

注意：pm2 start 失败时**不要** `set -e` + `>/dev/null` 组合（静默死亡难排查）；失败先 `pm2 logs <name> --nostream` 看真实报错。

## 阶段 3：Nginx 站点

vhost 写入 `/www/server/panel/vhost/nginx/<app>-web.conf`（完整模板见 references/templates.md）：`listen 8080;` + 四个 location（/ 静态 try_files、/admin/ alias、/update/ alias、/api/ proxy_pass + 60m body 上限）。

```bash
nginx -t && nginx -s reload
# reload 报 invalid PID number（pid 文件空/过期）→ /etc/init.d/nginx restart
```

自检（服务器本机）：四条路径 curl，期望 `200/200/200/4xx`。

## 阶段 4：外网验证与防火墙

1. 让用户在**轻量云控制台 → 防火墙**放行应用端口（给精确字段表：自定义/TCP/8080/0.0.0.0.0/0/允许）
2. 外网验证四条路径同上
3. 注册冒烟：POST 注册 → 带 token 访问业务接口 → 服务器上用 node:sqlite 删掉冒烟账号（生产库保持干净）
4. 管理后台：POST /api/admin/login 拿 token 验证密码生效

## 阶段 5：自动化运维（crontab）

```bash
0 9 * * * cd /www/wwwroot/<app> && /usr/local/bin/node --experimental-sqlite scripts/<report>.mjs >> reports/cron.log 2>&1
0 3 * * * cd /www/wwwroot/<app> && tar -czf /www/backup/<app>-data-$(date +%F).tar.gz server/data; ls -t /www/backup/<app>-data-*.tar.gz | tail -n +8 | xargs -r rm -f
```

cron 里用 `command -v node` 的**绝对路径**；备份保留 7 份。

## 阶段 6：一键发布流水线（本地项目侧）

项目根放 `scripts/release.mjs`（npm run release）：版本号未改拦截 → 构建前端/管理后台 → 打包 EXE（electron-builder，nsis+portable+latest.yml）→ scp 上传三处 → `--server` 时附带上传后端并 pm2 restart。要点：
- scp 传目录**内容**必须 `路径 + '/.'` 字符串拼接（path.join 会规范化吃掉它，否则 dist 变子目录）
- Windows 下 spawn `.cmd` 需 `shell:true`（Node ≥18.20 的 EINVAL 安全限制）；electron-builder 直接用 `process.execPath` 调它的 JS 入口绕开
- 发版 SOP 与回滚写进 `docs/发版手册.md`

## 阶段 7：EXE 相关（若项目有桌面端）

EXE 白屏排查顺序（file:// 三连坑 + 诊断法）详见 references/pitfalls.md 第 10–11 条：Google Fonts 渲染阻塞 → HashRouter → vite `base:'./'`；验证渲染用 CDP（`--remote-debugging-port` + Page.captureScreenshot），不要信远程桌面的屏幕截图（GPU 窗口抓不到，假白屏）。

## 阶段 8：推 GitHub（大陆网络）

直连被墙时的推送方案：GCM 凭证按 host 匹配 → `git credential fill` 取出 github.com 的 token → 嵌入镜像 URL 推送（`https://<user>:<token>@gh-proxy.com/https://github.com/<owner>/<repo>.git`）→ 固化：`git config url."https://gh-proxy.com/https://github.com".insteadOf "https://github.com"` + 对镜像 host `git credential approve`。全程 `GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never` 防非交互挂死，token 不回显。

## 交付物清单（每次部署完核对）

- [ ] 四条外网路径全通（网页版/管理后台/更新源/API）
- [ ] 管理密码已单独告知用户（不入任何仓库文件）
- [ ] crontab 日报+备份生效
- [ ] pm2 save 已执行（开机自启）
- [ ] 冒烟账号已清理
- [ ] 部署记录回填项目 AGENTS.md（含全部踩坑与解法）
- [ ] 发版/部署手册已就位（docs/）
