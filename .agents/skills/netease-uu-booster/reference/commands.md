# 命令参考文档

本文档详细描述 `uu-cli.exe` 的所有命令、参数和返回格式。

---

## 命令总览

| 命令 | 用途 | 常用参数 |
|------|------|---------|
| `doctor` | 环境检测 | 无 |
| `games` | 游戏查询 | `--search`, `--id` |
| `start` | 启动加速 | `--id`, `--zone`, `--server` |
| `stop` | 停止加速 | `--id`, `--all` |
| `status` | 状态查询 | `--id`, `--all` |

---

## 1. doctor - 环境检测

### 用途
检查 UU 加速器的安装状态、运行状态和服务可用性。

### 命令格式
```bash
bin\uu-cli.exe --json doctor
```

### 参数
无参数

### 返回结构
```json
{
  "success": true,
  "data": {
    "installed": boolean,           // UU是否已安装
    "running": boolean,             // UU进程是否运行
    "updating": boolean,            // 是否正在更新
    "serviceAvailable": boolean,    // HTTP服务是否可用
    "servicePort": number,          // 服务端口（通常是15555）
    "installPath": string,          // 安装路径
    "status": string                // 总体状态
  }
}
```

### status 字段取值

| 值 | 含义 | 后续操作 |
|----|------|---------|
| `ready` | 服务就绪，可以执行其他命令 | 继续执行 |
| `not_installed` | UU未安装 | 提示用户安装 |
| `not_running` | UU未运行 | 执行 start 命令启动 |
| `service_unavailable` | 服务不可用 | 等待或重启UU |

### 示例

**请求**：
```bash
bin\uu-cli.exe --json doctor
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "installed": true,
    "running": true,
    "updating": false,
    "serviceAvailable": true,
    "servicePort": 15555,
    "installPath": "C:\\Program Files\\Netease\\UU",
    "status": "ready"
  }
}
```

---

## 2. games - 游戏查询

### 用途
搜索游戏或获取游戏的详细信息（包括区服列表）。

### 命令格式
```bash
# 搜索游戏
bin\uu-cli.exe --json games --search "<关键词>"

# 获取游戏详情
bin\uu-cli.exe --json games --id <游戏ID>
```

### 参数

| 参数 | 缩写 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `--search` | `-s` | string | 与 --id 二选一 | 搜索关键词（支持中英文） |
| `--id` | 无 | string | 与 --search 二选一 | 游戏ID |

### 返回结构
```json
{
  "success": true,
  "data": {
    "code": number,
    "count": number,              // 结果数量
    "games": [
      {
        "id": string,             // 游戏ID
        "name": string,           // 游戏名称
        "zones": [                // 区服列表（仅 --id 查询时返回）
          {
            "id": string,         // 区ID
            "name": string,       // 区名称
            "servers": [
              {
                "id": string,     // 服务器ID
                "name": string    // 服务器名称
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 使用建议
- 搜索支持模糊匹配
- 中英文都可以搜索
- 如果返回多个结果，让用户选择
- 获取到游戏ID后，可以用 `--id` 获取完整区服信息

### 示例

**搜索游戏**：
```bash
bin\uu-cli.exe --json games --search "Apex"
```

**响应**：
```json
{
  "success": true,
  "data": {
    "code": 0,
    "count": 1,
    "games": [
      {
        "id": "10642",
        "name": "Apex 英雄",
        "zones": []
      }
    ]
  }
}
```

**获取详情**：
```bash
bin\uu-cli.exe --json games --id 10642
```

**响应**：
```json
{
  "success": true,
  "data": {
    "code": 0,
    "count": 1,
    "games": [
      {
        "id": "10642",
        "name": "Apex 英雄",
        "zones": [
          {
            "id": "1",
            "name": "亚洲服",
            "servers": [
              { "id": "101", "name": "东京" },
              { "id": "102", "name": "香港" }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 3. start - 启动加速

### 用途
启动 UU 程序或为指定游戏启动网络加速。

### 命令格式
```bash
# 启动UU程序
bin\uu-cli.exe --json start

# 启动游戏加速（基本）
bin\uu-cli.exe --json start --id <游戏ID>

# 启动游戏加速（指定区服）
bin\uu-cli.exe --json start --id <游戏ID> --zone <区ID> --server <服ID>

# 启动游戏加速（指定节点）
bin\uu-cli.exe --json start --id <游戏ID> --node <节点ID>
```

### 参数

| 参数 | 缩写 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `--id` | 无 | string | 启动加速时必填 | 游戏ID |
| `--zone` | `-z` | string | 可选 | 区ID（需与 --server 成对） |
| `--server` | `-s` | string | 可选 | 服务器ID（需与 --zone 成对） |
| `--node` | `-n` | string | 可选 | 加速节点ID |

### 参数规则
- 无参数：启动 UU 程序
- 有 `--id`：启动游戏加速
- `--zone` 和 `--server` 必须同时提供或都不提供
- `--node` 可以单独使用（用于指定加速节点）

### 返回结构
```json
{
  "success": true,
  "data": {
    "gameId": string,         // 游戏ID（启动加速时）
    "zoneId": string,         // 区ID（如果指定）
    "serverId": string,       // 服务器ID（如果指定）
    "nodeId": string,         // 节点ID（如果指定）
    "message": string,        // 状态消息
    "path": string            // UU程序路径（仅启动UU时）
  }
}
```

### 示例

**启动UU程序**：
```bash
bin\uu-cli.exe --json start
```

**启动游戏加速**：
```bash
bin\uu-cli.exe --json start --id 10642
```

**响应**：
```json
{
  "success": true,
  "data": {
    "gameId": "10642",
    "message": "Booster started successfully"
  }
}
```

---

## 4. stop - 停止加速

### 用途
停止游戏加速。

### 命令格式
```bash
# 停止所有（默认）
bin\uu-cli.exe --json stop

# 停止所有（显式）
bin\uu-cli.exe --json stop --all

# 停止指定游戏
bin\uu-cli.exe --json stop --id <游戏ID>
```

### 参数

| 参数 | 缩写 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `--id` | 无 | string | 可选 | 要停止的游戏ID |
| `--all` | `-a` | flag | 可选 | 停止所有加速 |

### 参数规则
- 无参数：停止所有加速
- `--all`：停止所有加速（与无参数效果相同）
- `--id`：停止指定游戏
- 优先级：`--all` > `--id`

### 返回结构
```json
{
  "success": true,
  "data": {
    "stoppedAll": boolean,    // 是否停止了所有
    "gameId": string,         // 游戏ID（停止指定游戏时）
    "message": string         // 状态消息
  }
}
```

### 示例

**停止所有**：
```bash
bin\uu-cli.exe --json stop
```

**响应**：
```json
{
  "success": true,
  "data": {
    "stoppedAll": true,
    "message": "All boosters stopped successfully"
  }
}
```

**停止指定游戏**：
```bash
bin\uu-cli.exe --json stop --id 10642
```

**响应**：
```json
{
  "success": true,
  "data": {
    "stoppedAll": false,
    "gameId": "10642",
    "message": "Booster stopped successfully"
  }
}
```

---

## 5. status - 状态查询

### 用途
查询当前加速状态和网络质量指标。

### 命令格式
```bash
# 查询所有
bin\uu-cli.exe --json status

# 查询所有（显式）
bin\uu-cli.exe --json status --all

# 查询指定游戏
bin\uu-cli.exe --json status --id <游戏ID>
```

### 参数

| 参数 | 缩写 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `--id` | 无 | string | 可选 | 查询指定游戏的状态 |
| `--all` | `-a` | flag | 可选 | 查询所有加速状态 |

### 返回结构
```json
{
  "success": true,
  "data": {
    "isBoosting": boolean,    // 是否有加速中的游戏
    "count": number,          // 加速中的游戏数量
    "boosters": [
      {
        "gameId": string,           // 游戏ID
        "gameName": string,         // 游戏名称
        "regionId": string,         // 区ID
        "regionName": string,       // 区名称
        "nodeId": string,           // 节点ID
        "nodeName": string,         // 节点名称
        "nodeMode": string,         // 节点模式
        "status": string,           // 状态
        "ping": number,             // 延迟(ms)，仅加速中可用
        "packetLoss": number        // 丢包率(%)，仅加速中可用
      }
    ]
  }
}
```

### status 字段取值

| 值 | 含义 |
|----|------|
| `not_boosting` | 未加速 |
| `boosting` | 加速中 |
| `starting` | 正在启动 |
| `stopping` | 正在停止 |

### 示例

**查询所有状态**：
```bash
bin\uu-cli.exe --json status
```

**响应（有加速）**：
```json
{
  "success": true,
  "data": {
    "isBoosting": true,
    "count": 2,
    "boosters": [
      {
        "gameId": "10642",
        "gameName": "Apex 英雄",
        "regionId": "1",
        "regionName": "亚洲服",
        "nodeId": "12345",
        "nodeName": "香港节点",
        "nodeMode": "全局",
        "status": "boosting",
        "ping": 35,
        "packetLoss": 0.5
      },
      {
        "gameId": "10001",
        "gameName": "原神",
        "regionId": "1",
        "regionName": "官服",
        "nodeId": "12346",
        "nodeName": "上海节点",
        "nodeMode": "全局",
        "status": "boosting",
        "ping": 28,
        "packetLoss": 0
      }
    ]
  }
}
```

**响应（无加速）**：
```json
{
  "success": true,
  "data": {
    "isBoosting": false,
    "count": 0,
    "boosters": []
  }
}
```

---

## 通用规则

### JSON 输出模式
所有命令都必须带 `--json` 参数以获取 JSON 格式输出。

### 响应格式
所有命令都遵循统一的响应格式：

**成功响应**：
```json
{
  "success": true,
  "data": { ... }
}
```

**失败响应**：
```json
{
  "success": false,
  "error": {
    "code": string,
    "message": string
  }
}
```

### 编码
- 输出编码：UTF-8
- 支持中文游戏名和路径

### 性能
| 命令 | 预期耗时 |
|------|---------|
| doctor | < 100ms |
| games --search | 100-500ms |
| games --id | 100-300ms |
| start | 200-1000ms |
| stop | 100-500ms |
| status | < 200ms |
