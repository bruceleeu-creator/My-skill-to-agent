# 示例：停止游戏加速

本文档展示如何使用 netease-uu-booster skill 停止游戏加速的完整对话流程。

---

## 场景1：停止所有加速

### 用户输入
```
停止所有加速
```
或
```
关闭加速
```

### AI执行步骤

#### Step 1: 查询当前加速状态
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
        ...
      },
      {
        "gameId": "10001",
        "gameName": "原神",
        ...
      }
    ]
  }
}
```

✅ 当前有 2 个游戏在加速

---

#### Step 2: 确认停止所有
（如果用户明确说"停止所有"，可跳过确认）

使用 `ask_user_question` 确认：
**问题**：当前有 2 个游戏正在加速，确认停止所有加速吗？

**选项**：
- 是，停止所有
- 否，让我选择

---

#### Step 3: 执行停止所有
```bash
bin\uu-cli.exe --json stop
```
或
```bash
bin\uu-cli.exe --json stop --all
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

✅ 停止成功

---

#### Step 4: 验证已停止
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

✅ 确认所有加速已停止

---

### AI 回复
```
✅ 已停止所有游戏的加速

已停止：
• Apex 英雄
• 原神

所有加速服务已关闭。
```

---

## 场景2：停止指定游戏

### 用户输入
```
停止 Apex 的加速
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

#### Step 3: 停止指定游戏
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

✅ 停止成功

---

#### Step 4: 验证已停止
```bash
bin\uu-cli.exe --json status --id 10642
```

**响应**：
```json
{
  "success": false,
  "error": {
    "code": "NOT_ACCELERATING",
    "message": "Game is not being accelerated"
  }
}
```

✅ 确认已停止

---

### AI 回复
```
✅ 已停止 Apex 英雄 的加速

加速服务已关闭。
```

---

## 场景3：当前无加速（无需停止）

### 用户输入
```
停止加速
```

### Step 1: 查询当前状态
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

❌ 当前无加速

---

### AI 回复
```
ℹ️ 当前没有正在加速的游戏

无需停止操作。如需加速游戏，请告诉我游戏名称。
```

---

## 场景4：多游戏时选择停止

### 用户输入
```
停止加速
```
（未明确指定游戏或是否停止所有）

### Step 1: 查询当前状态
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
        ...
      },
      {
        "gameId": "10001",
        "gameName": "原神",
        ...
      },
      {
        "gameId": "10003",
        "gameName": "使命召唤：战区",
        ...
      }
    ]
  }
}
```

有 3 个游戏在加速

---

### Step 2: 询问用户选择
使用 `ask_user_question`：

**问题**：当前有 3 个游戏正在加速，请选择操作：

**选项**：
- 停止所有加速
- Apex 英雄
- 原神
- 使命召唤：战区

---

### Step 3: 根据用户选择执行

**用户选择：停止所有加速**
→ 执行 `bin\uu-cli.exe --json stop --all`

**用户选择：Apex 英雄**
→ 执行 `bin\uu-cli.exe --json stop --id 10642`

---

## 场景5：停止失败

### Step 3: 执行停止
```bash
bin\uu-cli.exe --json stop --id 10642
```

**响应（失败）**：
```json
{
  "success": false,
  "error": {
    "code": "STOP_FAILED",
    "message": "Failed to stop booster"
  }
}
```

❌ 停止失败

---

### AI处理

#### 方案1：自动重试
```
⚠️ 停止加速失败，正在重试...
```

等待 3 秒后再次执行停止命令

#### 方案2：提示用户手动操作
如果重试仍失败：

```
❌ 停止加速失败

建议：
1. 等待几秒后重试
2. 在 UU 客户端中手动停止加速
3. 如果问题持续，请重启 UU 加速器
```

---

## 场景6：停止游戏未在加速

### Step 3: 执行停止
```bash
bin\uu-cli.exe --json stop --id 10642
```

**响应**：
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

无需停止操作。
```

---

## 批量停止多个指定游戏

### 用户输入
```
停止 Apex 和原神的加速
```

### 执行流程

#### Step 1: 识别多个游戏
从用户消息中提取：
- Apex
- 原神

#### Step 2: 搜索获取ID
分别搜索获取 ID：
- Apex 英雄 → 10642
- 原神 → 10001

#### Step 3: 逐个停止
```bash
bin\uu-cli.exe --json stop --id 10642
```

```bash
bin\uu-cli.exe --json stop --id 10001
```

#### Step 4: 汇总结果

---

### AI 回复
```
✅ 已停止以下游戏的加速：

• Apex 英雄 - 成功
• 原神 - 成功

所选游戏的加速服务已关闭。
```

---

## 关键要点总结

### ✅ 核心步骤
1. **查询状态** - 确认有哪些游戏在加速
2. **确认目标** - 停止所有还是停止指定游戏
3. **执行停止** - 使用 `stop` 命令
4. **验证结果** - 确认停止成功

### 🎯 停止命令

| 用户意图 | 命令 |
|---------|------|
| 停止所有 | `bin\uu-cli.exe --json stop` |
| 停止所有（显式） | `bin\uu-cli.exe --json stop --all` |
| 停止指定游戏 | `bin\uu-cli.exe --json stop --id <游戏ID>` |

### ⚠️ 注意事项
- 无参数的 `stop` 默认停止所有
- `--all` 优先级高于 `--id`
- 停止未加速的游戏会返回 `NOT_ACCELERATING` 错误（正常情况）
- 停止失败时可以重试或提示手动操作

### 💡 用户体验优化
- 无加速时友好提示，无需报错
- 多游戏时让用户选择具体操作
- 停止成功后列出已停止的游戏
- 失败时提供明确的解决建议
- 批量停止时展示每个游戏的结果

### 🔄 错误恢复
- `NOT_ACCELERATING` - 信息提示，无需恢复
- `STOP_FAILED` - 等待重试或提示手动操作
- `SERVICE_UNAVAILABLE` - 检查 UU 运行状态
