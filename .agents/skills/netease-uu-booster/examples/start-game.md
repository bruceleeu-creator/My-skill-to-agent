# 示例：启动游戏加速

本文档展示如何使用 netease-uu-booster skill 为游戏启动网络加速的完整对话流程。

---

## 场景1：基本加速流程

### 用户输入
```
帮我加速Apex
```

### AI执行步骤

#### Step 1: 环境检测
```bash
bin\uu-cli.exe --json doctor
```

**响应**：
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

✅ 环境检查通过，可以继续执行

---

#### Step 2: 搜索游戏
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

✅ 找到游戏：Apex 英雄（ID: 10642）

---

#### Step 3: 启动加速
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

✅ 加速启动成功

---

#### Step 4: 等待并验证状态
等待 3 秒...

```bash
bin\uu-cli.exe --json status --id 10642
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
        "status": "boosting",
        "ping": 35,
        "packetLoss": 0.5
      }
    ]
  }
}
```

✅ 加速中，状态正常

---

### AI 回复
```
✅ 已为您启动 Apex 英雄 的加速

📍 节点：香港节点
⚡ 延迟：35ms
📶 丢包率：0.5%

祝您游戏愉快！
```

---

## 场景2：需要选择游戏（多个搜索结果）

### 用户输入
```
加速使命召唤
```

### Step 2: 搜索游戏（多个结果）
```bash
bin\uu-cli.exe --json games --search "使命召唤"
```

**响应**：
```json
{
  "success": true,
  "data": {
    "code": 0,
    "count": 3,
    "games": [
      {
        "id": "10001",
        "name": "使命召唤：现代战争",
        "zones": []
      },
      {
        "id": "10002",
        "name": "使命召唤：冷战",
        "zones": []
      },
      {
        "id": "10003",
        "name": "使命召唤：战区",
        "zones": []
      }
    ]
  }
}
```

### AI 询问用户
使用 `ask_user_question` 工具：

**问题**：找到 3 个相关游戏，请选择要加速的游戏：

**选项**：
- 使命召唤：现代战争
- 使命召唤：冷战
- 使命召唤：战区

### 用户选择
```
使命召唤：战区
```

### 继续执行
提取选择的游戏ID（10003），继续 Step 3 启动加速...

---

## 场景3：指定区服加速

### 用户输入
```
加速原神，选择亚服
```

### 执行流程

#### Step 1-2: 环境检测 + 搜索游戏
（同场景1）

#### Step 3: 获取游戏详情（包含区服）
```bash
bin\uu-cli.exe --json games --id 10001
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
        "id": "10001",
        "name": "原神",
        "zones": [
          {
            "id": "1",
            "name": "官服",
            "servers": [
              { "id": "101", "name": "天空岛" },
              { "id": "102", "name": "世界树" }
            ]
          },
          {
            "id": "2",
            "name": "亚服",
            "servers": [
              { "id": "201", "name": "Asia" }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Step 4: 询问具体服务器
**问题**：请选择亚服下的服务器：

**选项**：
- Asia

（或者直接选择第一个）

#### Step 5: 启动加速（指定区服）
```bash
bin\uu-cli.exe --json start --id 10001 --zone 2 --server 201
```

**响应**：
```json
{
  "success": true,
  "data": {
    "gameId": "10001",
    "zoneId": "2",
    "serverId": "201",
    "message": "Booster started successfully"
  }
}
```

---

## 场景4：UU未运行（自动恢复）

### Step 1: 环境检测
```bash
bin\uu-cli.exe --json doctor
```

**响应**：
```json
{
  "success": true,
  "data": {
    "installed": true,
    "running": false,
    "updating": false,
    "serviceAvailable": false,
    "servicePort": 0,
    "installPath": "C:\\Program Files\\Netease\\UU",
    "status": "not_running"
  }
}
```

❌ UU 未运行

### AI 自动恢复

**提示用户**：
```
⚠️ UU加速器未运行，正在为您启动...
```

**执行启动**：
```bash
bin\uu-cli.exe --json start
```

**响应**：
```json
{
  "success": true,
  "data": {
    "path": "C:\\Program Files\\Netease\\UU\\uu.exe",
    "message": "UU Booster started"
  }
}
```

**等待服务就绪**：
```
等待 5 秒让 UU 服务初始化...
```

**重新检测**：
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

✅ UU 已启动并就绪

**提示用户**：
```
✅ UU 已启动，继续为您加速游戏...
```

继续执行游戏搜索和加速启动...

---

## 场景5：游戏未找到

### Step 2: 搜索游戏
```bash
bin\uu-cli.exe --json games --search "不存在的游戏"
```

**响应**：
```json
{
  "success": false,
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game not found with search keyword"
  }
}
```

### AI 回复
```
❌ 未找到相关游戏："不存在的游戏"

建议：
1. 检查游戏名称拼写
2. 尝试使用更简短的关键词
3. 确认游戏是否在 UU 支持列表中

您可以重新描述游戏名称，或者告诉我具体的游戏名称。
```

---

## 关键要点总结

### ✅ 必须执行的步骤
1. **环境检测**（doctor）- 确保 UU 可用
2. **游戏搜索**（games --search）- 获取游戏ID
3. **启动加速**（start --id）- 启动加速
4. **验证状态**（status）- 确认加速成功

### ⚡ 可选优化
- 多个结果时让用户选择
- 指定区服时获取详情并让用户选择
- 自动恢复 UU_NOT_RUNNING 错误
- 友好的状态提示和emoji展示

### 🎯 用户体验重点
- 清晰的步骤提示
- 自动处理常见问题
- 显示关键指标（延迟、丢包率）
- 友好的成功/失败反馈
