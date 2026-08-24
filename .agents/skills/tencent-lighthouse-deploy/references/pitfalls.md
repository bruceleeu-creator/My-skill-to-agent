# 实战踩坑清单（按遇到顺序，全部实跑验证过）

## 1. known_hosts 指纹变化
**现象**：`WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`，SSH 拒连。
**原因**：服务器重装过系统 / 换过镜像，本机旧指纹不匹配。
**解法**：`ssh-keygen -R <IP>` 清掉旧记录，重连加 `-o StrictHostKeyChecking=accept-new`。用户自己的服务器 + 刚给过面板凭证时可直接清。

## 2. node:sqlite 版本差异（本次最大的暗坑）
**现象**：本地跑得好好的，服务器 pm2 日志报 `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`。
**原因**：`node:sqlite` 在 22.5.0 引入但需 `--experimental-sqlite` 标志，22.13.0 才默认启用。本地 v24 无感，服务器 v22.11 踩雷。
**解法**：启动加 `--experimental-sqlite`（有 ExperimentalWarning 属正常）。**教训：本地与服务器 Node 版本对齐，或提前查目标版本特性门槛。**

## 3. pm2 传 node 参数经 SSH 拆坏
**现象**：`pm2 start index.js --node-args "--env-file=.env --experimental-sqlite"` 报 `node: .env --experimental-sqlite: not found`。
**原因**：参数里的 `=` 和空格经过 SSH + pm2 双层解析被拆散。
**解法**：写 `start.sh`（`exec node --env-file=.env --experimental-sqlite index.js`）交给 pm2 执行。**凡是复杂 node 参数一律走包装脚本。**

## 4. set -e + 静默重定向导致脚本无声死亡
**现象**：远程脚本输出全空，进程被删了没重建。
**原因**：`set -e` 遇上 `pm2 start >/dev/null 2>&1` 失败即退出，后续全不执行，且看不到错误。
**解法**：排查期去掉 `set -e` 和重定向；失败先 `pm2 logs <name> --nostream`。

## 5. 80 端口被其他进程直占
**现象**：nginx reload 报 `invalid PID number`，起不来；80 上是用户的另一个 pm2 应用。
**解法**：`ss -tlnp | grep :80` 找真凶 → **不动它**，应用换端口（8080）。服务器是用户的生产机，可能有 doraemon、docker 全家桶（new-api/postgres/redis）等，侦察阶段就要摸清并绕开。

## 6. 多个 vhost 抢 80
**现象**：nginx 起不来，`listen 80` 冲突。
**解法**：把 vhost 目录里所有监听 80 的 conf（含宝塔自带 `phpfpm_status.conf`）`mv` 成 `.bak`（nginx 本来没跑时零影响）；自己的 conf `listen 8080`。

## 7. nginx pid 文件失效无法热重载
**现象**：`nginx -t` 通过但 `nginx -s reload` 报 `invalid PID number "" in nginx.pid`。
**解法**：`/etc/init.d/nginx restart`（宝塔体系）整进程重启。

## 8. scp 传目录内容的 '/.' 陷阱
**现象**：`scp -r .../dist target:/dir/` 把 dist 传成了 `/dir/dist/` 子目录，首页 404/403。
**原因**：想传「目录内容」要在源路径加 `/.`，但 JS `path.join('a','b','.')` 会规范化吃掉它。
**解法**：字符串拼接 `path.join(root,'app','dist') + '/.'`。

## 9. 远程输出的过滤正则太狠
**现象**：grep -vE 过滤横幅把正常输出也吞了，误判命令没执行。
**解法**：腾讯云镜像 motd 微信二维码横幅很长，过滤用精确模式；排查时先去掉过滤看原始输出。ssh 加 `-q` 也能减噪。

## 10. EXE（file://）三连坑 → 白屏
1. **Google Fonts 渲染阻塞**：`<link rel=stylesheet>` 指向被墙域名，请求挂起阻塞整个页面渲染且**无任何 JS 报错**（大陆 Electron 必踩）。解法：删外网字体，走系统字体回退链。
2. **BrowserRouter**：file:// 下 location.pathname 是文件路径，路由全匹配不上 → 空渲染。解法：`HashRouter`。
3. **Vite 绝对资源路径**：构建产物 `/assets/...` 在 file:// 下解析到磁盘根 → JS/CSS 根本没加载。解法：`vite.config` 加 `base: './'`。
三个坑可叠加出现，逐层修。

## 11. 远程桌面截图抓不到 GPU 窗口（假白屏）
**现象**：PowerShell CopyFromScreen 截图里 Electron 窗口一片白，实际页面渲染正常。
**解法**：用 CDP 从渲染进程内部截图：`exe --remote-debugging-port=9223`（9222 可能被占）→ `fetch http://127.0.0.1:9223/json/list` 拿 ws → `Runtime.evaluate` 看 root.innerHTML / document.styleSheets / body.innerText → `Page.captureScreenshot` 出真图。Node 22+ 自带 WebSocket，无需装依赖。

## 12. git 推 GitHub：凭证按 host 匹配 + 直连被墙
**现象**：远程是镜像 URL 时 GCM 查不到凭证弹窗失败；切回 github.com 又 Connection reset。
**解法**：`git credential fill`（host=github.com）取出存储的 token → 嵌入镜像 URL 推送 → `url.insteadOf` + 对镜像 host `credential approve` 固化。全程 `GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never`，token 不出现在输出里。

## 13. 轻量云防火墙的位置
**现象**：服务器上查 iptables/ufw 看不到规则，端口却不通。
**原因**：轻量云防火墙在**腾讯云控制台**（实例详情 → 防火墙），云层拦截。
**解法**：让用户控制台放行（给精确字段表）；服务器侧只需确认进程监听 0.0.0.0。

## 14. 本地路由器 DNS 劫持
**现象**：不存在的域名也解析出 192.168.31.1（路由器 IP），探测结论全错。
**解法**：探测域名一律显式指定公共 DNS：`nslookup <domain> 119.29.29.29`（腾讯）。

## 15. 腾讯云宝塔镜像的 motd 横幅
每次 SSH 登录打印微信扫码登录大横幅，污染所有输出。过滤之，或忽略。面板登录失败次数有限制（约 5 次锁），连错 2 次就停手换路径。

## 16. vite build 的环境模式
`npm run build` 走 `.env.production`（生产 API 地址），本地联调生产包会连错后端。本地测用 dev 模式；「构建产物里 grep API 地址」是验收手段。
