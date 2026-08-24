# 示例：查询加速状态

本文档展示如何使用 netease-uu-booster skill 查询当前加速状态的完整对话流程。

---

## 场景1：查询所有加速状态（有加速）

### 用户输入
```
现在加速了什么游戏？
```
或
```
查看加速状态
```

### AI执行步骤

#### Step 1: （可选）快速环境检查
```bash
bin\uu-cli.exe --json doctor
```

**响应**：
```json
{
  "success": true,
  "data": {
    "status": "ready",
    ...
  }
}
```

---

#### Step 2: 查询所有加速状态
```bash
bin\uu-cli.exe --json status
```

**响应**：
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

---

### AI 回复
```
🎮 当前正在加速 2 款游戏：

1. Apex 英雄 - 亚洲服
   📍 节点：香港节点
   ⚡ 延迟：35ms
   📶 丢包率：0.5%

2. 原神 - 官服
   📍 节点：上海节点
   ⚡ 延迟：28ms
   📶 丢包率：0%
```

---

## 场景2：查询所有加速状态（无加速）

### 用户输入
```
查看加速状态
```

### Step 2: 查询状态
```bash
bin\uu-cli.exe --json status
```

**响应**：
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

### AI 回复
```
ℹ️ 当前没有正在加速的游戏

如需加速游戏，请告诉我游戏名称，我会帮您启动加速。
```

---

## 场景3：查询指定游戏状态

### 用户输入
```
Apex 的加速状态怎么样？
```

### AI执行步骤

#### Step 1: 识别游戏名称
从用户消息中提取游戏名："Apex"

#### Step 2: 搜索游戏获取ID
```bash
bin\uu-cli.exe --json games --search "Apex"
```

**响应**：
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "10642",
        "name": "Apex 英雄"
      }
    ]
  }
}
```

获取游戏ID：10642

---

#### Step 3: 查询指定游戏状态
```bash
bin\uu-cli.exe --json status --id 10642
```

**响应（加速中）**：
```json
{
  "success": true,
  "data": {
    "isBoosting": true,
    "count": 1,
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
      }
    ]
  }
}
```

---

### AI 回复
```
🎮 Apex 英雄 加速状态：

✅ 加速中
📍 节点：香港节点（全局模式）
⚡ 延迟：35ms
📶 丢包率：0.5%

网络质量良好，祝您游戏愉快！
```

---

## 场景4：指定游戏未加速

### Step 3: 查询指定游戏状态
```bash
bin\uu-cli.exe --json status --id 10642
```

**响应（未加速）**：
```json
{
  "success": false,
  "error": {
    "code": "NOT_ACCELERATING",
    "message": "Game is not being accelerated"
  }
}
```

---

### AI 回复
```
ℹ️ Apex 英雄 当前未在加速中

需要我为您启动加速吗？
```

---

## 场景5：加速正在启动中

### Step 2: 查询状态
```bash
bin\uu-cli.exe --json status
```

**响应**：
```json
{
  "success": true,
  "data": {
    "isBoosting": true,
    "count": 1,
    "boosters": [
      {
        "gameId": "10642",
        "gameName": "Apex 英雄",
        "regionId": "1",
        "regionName": "亚洲服",
        "nodeId": "12345",
        "nodeName": "香港节点",
        "nodeMode": "全局",
        "status": "starting",
        "ping": null,
        "packetLoss": null
      }
    ]
  }
}
```

---

### AI 回复
```
🎮 当前加速状态：

1. Apex 英雄 - 亚洲服
   ⏳ 状态：正在启动加速
   📍 节点：香港节点

加速正在启动中，请稍候片刻...
```

---

## 场景6：多个游戏的混合状态

### Step 2: 查询状态
```bash
bin\uu-cli.exe --json status
```

**响应**：
```json
{
  "success": true,
  "data": {
    "isBoosting": true,
    "count": 3,
    "boosters": [
      {
        "gameId": "10642",
        "gameName": "Apex 英雄",
        "status": "boosting",
        "ping": 35,
        "packetLoss": 0.5,
        ...
      },
      {
        "gameId": "10001",
        "gameName": "原神",
        "status": "starting",
        "ping": null,
        "packetLoss": null,
        ...
      },
      {
        "gameId": "10003",
        "gameName": "使命召唤：战区",
        "status": "stopping",
        "ping": null,
        "packetLoss": null,
        ...
      }
    ]
  }
}
```

---

### AI 回复
```
🎮 当前加速状态（3款游戏）：

1. Apex 英雄 - 亚洲服
   ✅ 加速中
   📍 节点：香港节点 | ⚡ 延迟：35ms | 📶 丢包：0.5%

2. 原神 - 官服
   ⏳ 正在启动加速
   📍 节点：上海节点

3. 使命召唤：战区 - 美服
   ⏸️ 正在停止加速
   📍 节点：洛杉矶节点
```

---

## 状态字段说明

### status 取值

| 状态值 | 含义 | 显示图标 | 是否有ping数据 |
|--------|------|---------|---------------|
| `boosting` | 加速中 | ✅ | 是 |
| `starting` | 正在启动 | ⏳ | 否 |
| `stopping` | 正在停止 | ⏸️ | 否 |
| `not_boosting` | 未加速 | ⭕ | 否 |

### 网络指标

- **ping**（延迟）：
  - 单位：毫秒(ms)
  - 仅 `boosting` 状态可用


- **packetLoss**（丢包率）：
  - 单位：百分比(%)
  - 仅 `boosting` 状态可用


---

## 关键要点总结

### ✅ 核心步骤
1. **查询所有**：`bin\uu-cli.exe --json status`
2. **查询指定游戏**：先获取游戏ID，再 `bin\uu-cli.exe --json status --id <ID>`

### 🎨 展示优化
- 使用 emoji 增强可读性
- 根据状态显示不同图标
- 根据延迟和丢包率给出评价
- 格式化展示多个游戏

### 📊 数据解析
- 检查 `isBoosting` 判断是否有加速
- 遍历 `boosters` 数组获取每个游戏信息
- 根据 `status` 决定显示内容
- `ping` 和 `packetLoss` 仅在 `boosting` 状态可用

### 💡 用户体验
- 无加速时引导用户启动加速
- 启动中时提示用户等待
- 加速中时显示详细网络指标
- 多游戏时清晰列出每个状态
