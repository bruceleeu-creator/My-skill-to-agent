# 错误处理指南

本文档描述 `uu-cli.exe` 可能返回的错误码、错误原因和处理建议。

---

## 错误响应格式

所有错误都遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

---

## 错误码参考

### UU_NOT_INSTALLED

**含义**：网易UU加速器未安装

**触发场景**：
- 执行任何命令时，系统中未检测到 UU 加速器

**处理方式**：
1. 提示用户从官网下载安装：https://uu.163.com
2. 等待用户安装完成后重试
3. 不要继续执行其他命令

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "UU_NOT_INSTALLED",
    "message": "UU Booster is not installed"
  }
}
```

**用户友好提示**：
```
❌ 未检测到网易UU加速器

请先安装网易UU加速器：
1. 访问 https://uu.163.com
2. 下载并安装客户端
3. 安装完成后重试
```

---

### UU_BUSY

**含义**：UU主窗口被禁用（有模态对话框弹出）

**触发场景**：
- UU正在显示模态对话框（设置窗口、登录框、确认弹窗等）
- UU主窗口被其他操作锁定

**处理方式**：
1. 提示用户关闭UU中打开的对话框
2. 等待用户操作后重试
3. 不要自动重试，需要用户手动操作

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "UU_BUSY",
    "message": "UU is busy, please close any open dialogs and try again"
  }
}
```

**用户友好提示**：
```
⚠️ UU加速器正忙

请关闭UU中打开的对话框后重试：
1. 检查是否有设置窗口、登录框等弹窗
2. 关闭所有弹出的对话框
3. 然后重试操作
```

---

### UU_NOT_RUNNING

**含义**：UU加速器未运行

**触发场景**：
- UU 已安装但进程未启动
- 用户手动关闭了 UU 程序

**处理方式**：
1. 自动尝试启动 UU：
   ```bash
   bin\uu-cli.exe --json start
   ```
2. 启动成功后，等待 3-5 秒让服务初始化
3. 重试原命令

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "UU_NOT_RUNNING",
    "message": "UU Booster is not running"
  }
}
```

**自动恢复示例**：
```
⚠️ UU加速器未运行，正在启动...
✅ UU已启动，请稍候...
```

---

### SERVICE_UNAVAILABLE

**含义**：UU的HTTP服务不可用

**触发场景**：
- UU进程在运行，但本地HTTP服务（端口15555）未就绪
- UU正在启动过程中
- UU正在更新
- 服务异常崩溃

**处理方式**：
1. 等待 3-5 秒后重试（适用于刚启动的情况）
2. 如果多次失败，提示用户手动重启 UU
3. 检查是否有防火墙或杀毒软件阻止本地通信

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "UU Booster service is not available"
  }
}
```

**用户友好提示**：
```
⚠️ UU服务暂时不可用

建议操作：
1. 等待几秒后重试（UU可能正在启动）
2. 如果持续失败，请手动重启UU加速器
3. 检查防火墙是否阻止了本地通信
```

---

### INVALID_PARAMS

**含义**：命令参数无效

**触发场景**：
- 必填参数缺失（如 start 命令缺少 --id）
- 参数格式错误
- 参数组合不合法（如只提供 --zone 没有 --server）

**处理方式**：
1. 检查命令格式是否正确
2. 确保必填参数都已提供
3. 确保 --zone 和 --server 成对使用
4. 参考 `reference/commands.md` 确认正确用法

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "--zone and --server must be used together"
  }
}
```

**常见错误**：
- ❌ `start --zone 1`（缺少 --server）
- ✅ `start --zone 1 --server 101`

---

### GAME_NOT_FOUND

**含义**：游戏未找到

**触发场景**：
- 搜索关键词没有匹配结果
- 指定的游戏ID不存在
- 游戏名称拼写错误

**处理方式**：
1. 提示用户检查游戏名称拼写
2. 建议使用更简短或更通用的关键词
3. 让用户确认游戏是否在UU支持列表中

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game not found with search keyword"
  }
}
```

**用户友好提示**：
```
❌ 未找到相关游戏

建议：
1. 检查游戏名称拼写
2. 尝试使用更简短的关键词（如"Apex"而不是"Apex英雄"）
3. 确认游戏是否在UU支持列表中
```

---

### NOT_ACCELERATING

**含义**：游戏未在加速中

**触发场景**：
- 尝试停止一个未在加速的游戏
- 查询一个未启动加速的游戏状态

**处理方式**：
1. 提示用户该游戏当前未在加速
2. 如果用户想加速，引导使用 start 命令
3. 不需要报错，只是信息提示

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "NOT_ACCELERATING",
    "message": "Game is not being accelerated"
  }
}
```

**用户友好提示**：
```
ℹ️ 该游戏当前未在加速中

如需加速，请使用启动加速功能。
```

---

### START_FAILED

**含义**：启动加速失败

**触发场景**：
- UU内部错误导致加速启动失败
- 游戏ID有效但无法加速
- 网络问题导致无法连接加速节点

**处理方式**：
1. 提示用户稍后重试
2. 建议检查网络连接
3. 建议在UU客户端中手动尝试

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "START_FAILED",
    "message": "Failed to start booster"
  }
}
```

**用户友好提示**：
```
❌ 启动加速失败

建议：
1. 检查网络连接
2. 稍后重试
3. 尝试在UU客户端中手动启动
```

---

### STOP_FAILED

**含义**：停止加速失败

**触发场景**：
- UU内部错误导致停止失败
- 加速正在启动中，无法立即停止

**处理方式**：
1. 等待几秒后重试
2. 提示用户在UU客户端中手动停止

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "STOP_FAILED",
    "message": "Failed to stop booster"
  }
}
```

---

### NETWORK_ERROR

**含义**：网络请求错误

**触发场景**：
- 与UU本地服务通信超时
- HTTP请求失败
- JSON解析错误

**处理方式**：
1. 重试请求（最多3次）
2. 检查 UU 是否正常运行
3. 检查本地防火墙设置

**示例响应**：
```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Failed to connect to UU service"
  }
}
```

---

## 错误处理流程图

```
命令执行
    ↓
检查 success 字段
    ↓
success = false
    ↓
提取 error.code
    ↓
┌────────────────────────────┐
│ UU_NOT_INSTALLED           │ → 提示安装 → 结束
├────────────────────────────┤
│ UU_BUSY                    │ → 提示关闭弹窗 → 用户操作后重试
├────────────────────────────┤
│ UU_NOT_RUNNING             │ → 自动启动 → 重试
├────────────────────────────┤
│ SERVICE_UNAVAILABLE        │ → 等待3-5秒 → 重试
├────────────────────────────┤
│ INVALID_PARAMS             │ → 检查参数 → 修正后重试
├────────────────────────────┤
│ GAME_NOT_FOUND             │ → 提示用户 → 重新搜索
├────────────────────────────┤
│ NOT_ACCELERATING           │ → 提示信息 → 结束
├────────────────────────────┤
│ START_FAILED / STOP_FAILED │ → 提示重试 → 用户决定
├────────────────────────────┤
│ NETWORK_ERROR              │ → 重试3次 → 提示检查
└────────────────────────────┘
```

---

## 错误处理最佳实践

### 1. 分级处理

**严重错误**（终止流程）：
- `UU_NOT_INSTALLED`
- `INVALID_PARAMS`（修正前）

**需用户操作的错误**（等待用户处理）：
- `UU_BUSY` → 关闭弹窗

**可恢复错误**（自动恢复）：
- `UU_NOT_RUNNING` → 自动启动
- `SERVICE_UNAVAILABLE` → 等待重试
- `NETWORK_ERROR` → 自动重试

**信息性错误**（提示即可）：
- `NOT_ACCELERATING`
- `GAME_NOT_FOUND`

### 2. 重试策略

```
NETWORK_ERROR 或 SERVICE_UNAVAILABLE:
  第1次: 立即重试
  第2次: 等待3秒后重试
  第3次: 等待5秒后重试
  失败3次: 提示用户并终止
```

### 3. 友好提示

❌ **不好的提示**：
```
Error: UU_NOT_RUNNING
```

✅ **好的提示**：
```
⚠️ UU加速器未运行

正在为您启动UU...
✅ UU已启动，继续执行您的请求
```

### 4. 日志记录

对于错误，建议记录：
- 错误码
- 错误消息
- 触发命令
- 时间戳

---

## 常见问题排查

### Q: 为什么一直显示 SERVICE_UNAVAILABLE？

**可能原因**：
1. UU刚启动，服务未就绪 → 等待10-15秒
2. UU版本过旧 → 提示更新
3. 防火墙阻止 → 检查防火墙设置
4. 端口被占用 → 重启UU

### Q: 游戏搜索总是返回 GAME_NOT_FOUND？

**可能原因**：
1. 游戏名称拼写错误 → 检查拼写
2. UU不支持该游戏 → 在客户端中确认
3. 服务异常 → 重启UU

### Q: START_FAILED 但在客户端可以启动？

**可能原因**：
1. CLI版本与UU版本不兼容 → 更新CLI
2. 参数传递错误 → 检查参数格式
3. 并发请求冲突 → 等待前一个请求完成

---

## 错误码速查表

| 错误码 | 严重性 | 自动恢复 | 用户操作 |
|--------|--------|---------|---------|
| UU_NOT_INSTALLED | 🔴 高 | ❌ | 安装UU |
| UU_BUSY | 🟡 中 | ❌ | 关闭弹窗 |
| UU_NOT_RUNNING | 🟡 中 | ✅ | 无需操作 |
| SERVICE_UNAVAILABLE | 🟡 中 | ✅ | 等待或重启 |
| INVALID_PARAMS | 🔴 高 | ❌ | 检查参数 |
| GAME_NOT_FOUND | 🟢 低 | ❌ | 修改关键词 |
| NOT_ACCELERATING | 🟢 低 | ❌ | 无需操作 |
| START_FAILED | 🟡 中 | ⚠️ | 重试或手动操作 |
| STOP_FAILED | 🟡 中 | ⚠️ | 重试或手动操作 |
| NETWORK_ERROR | 🟡 中 | ✅ | 检查网络 |
