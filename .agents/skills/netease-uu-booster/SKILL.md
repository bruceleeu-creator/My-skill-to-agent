---
name: netease-uu-booster
display_name: "网易UU游戏加速器控制"
description: "通过命令行自动控制网易UU游戏加速器，一键启动/停止游戏加速，实时查询网络状态（延迟、丢包率）。支持 Apex 英雄、原神、使命召唤、英雄联盟等热门游戏的网络优化。当用户提到：加速游戏、启动加速、停止加速、查看加速状态、UU加速器、游戏网络优化、降低延迟、减少丢包时使用。"
tags:
  - game-booster
  - network-optimization
  - gaming
  - uu-booster
  - netease
  - automation
  - cli-tool
  - 游戏加速
  - 网络加速
  - 网易UU
  - 游戏工具
  - 延迟优化
metadata:
  version: "1.0.0"
  platform: "windows"
  category: "gaming-tools"
  author: "netease-uu-booster"
  license: "MIT"
  language: "zh-CN"
  keywords:
    - "游戏加速器"
    - "UU加速器"
    - "网易UU"
    - "game booster"
    - "network accelerator"
    - "ping优化"
    - "延迟优化"
    - "丢包优化"
    - "游戏网络"
    - "Apex英雄"
    - "原神"
    - "使命召唤"
    - "英雄联盟"
    - "吃鸡加速"
    - "游戏加速"
    - "网络加速"
    - "命令行工具"
    - "自动化"
  features:
    - "自动环境检测和UU启动"
    - "支持200+热门游戏加速"
    - "实时网络质量监控（延迟/丢包率）"
    - "智能游戏搜索（中英文模糊匹配）"
    - "区服精准选择"
    - "一键启动/停止加速"
    - "批量管理多游戏加速"
  use_cases:
    - "竞技游戏降低延迟提升操作手感"
    - "跨服游玩海外游戏"
    - "直播/录制时稳定网络"
    - "多开游戏时网络优化"
    - "自动化游戏启动流程"
  supported_games_examples:
    - "Apex 英雄"
    - "原神 Genshin Impact"
    - "使命召唤 Call of Duty"
    - "英雄联盟 LOL"
    - "绝地求生 PUBG"
    - "Valorant"
    - "CS:GO / CS2"
    - "彩虹六号"
  dependencies:
    - "网易UU加速器客户端 (https://uu.163.com)"
  requirements:
    - "Windows 10/11 (x64)"
    - "网易UU加速器已安装并运行"
  performance:
    typical_latency: "< 200ms"
    success_rate: "> 95%"
---

# 网易UU加速器控制 Skill

本 skill 通过 `uu-cli.exe` 命令行工具控制网易UU游戏加速器，支持游戏搜索、加速启动、状态查询和加速停止等功能。

---

## 目录结构

```
netease-uu-booster/
├── SKILL.md              # 本文档
├── bin/
│   └── uu-cli.exe        # UU加速器CLI工具
├── reference/
│   ├── commands.md       # 命令参考文档
│   └── errors.md         # 错误处理指南
└── examples/
    ├── start-game.md     # 启动游戏加速示例
    ├── check-status.md   # 查询状态示例
    └── stop-game.md      # 停止加速示例
```

---

## 前置条件

1. **操作系统**：Windows 10/11 (x64)
2. **依赖软件**：已安装并运行网易UU加速器客户端（从 https://uu.163.com 下载）
3. **CLI工具**：`bin/uu-cli.exe` 已包含在本 skill 中

---

## 使用模式识别

| 用户意图 | 触发关键词 | 执行工作流 | 输出结果 |
|---------|-----------|-----------|---------|
| 启动游戏加速 | "加速XXX"、"启动加速"、"开启加速" | 工作流1：启动游戏加速 | 加速成功，显示延迟 |
| 查询加速状态 | "加速状态"、"在加速什么"、"查看加速" | 工作流2：查询状态 | 列出所有加速中的游戏 |
| 停止加速 | "停止加速"、"关闭加速"、"取消加速" | 工作流3：停止加速 | 停止成功确认 |
| 检查环境 | "UU是否运行"、"检查UU" | 单步：环境检测 | 显示UU运行状态 |

---

## 核心工作流

### 工作流1：启动游戏加速

**适用场景**：用户想要为某个游戏启动网络加速

**执行步骤**：

1. **环境检测**
   ```bash
   bin\uu-cli.exe --json doctor
   ```
   - 检查返回的 `data.status` 字段
   - 若为 `ready`，继续下一步
   - 若为 `not_installed`，提示用户安装UU（https://uu.163.com）
   - 若为 `not_running`，执行 `bin\uu-cli.exe --json start` 启动UU程序
   - 若为 `service_unavailable`，提示用户等待3-5秒或重启UU

2. **搜索游戏**
   ```bash
   bin\uu-cli.exe --json games --search "用户提到的游戏名"
   ```
   - 从返回的 `data.games` 数组中提取游戏列表
   - 若返回多个结果，使用 `ask_user_question` 让用户选择
   - 若无结果，提示用户检查游戏名称

3. **（可选）选择区服**
   - 若游戏需要指定区服，执行：
     ```bash
     bin\uu-cli.exe --json games --id <游戏ID>
     ```
   - 展示区服列表，让用户选择 zone 和 server
   - 大多数游戏可以跳过此步骤

4. **启动加速**
   ```bash
   # 基本启动（推荐）
   bin\uu-cli.exe --json start --id <游戏ID>
   
   # 指定区服启动
   bin\uu-cli.exe --json start --id <游戏ID> --zone <区ID> --server <服ID>
   ```
   - **注意**：`--zone` 和 `--server` 必须成对使用

5. **验证状态**
   - 等待 3-5 秒让加速启动完成
   - 执行状态查询：
     ```bash
     bin\uu-cli.exe --json status --id <游戏ID>
     ```
   - 检查 `data.boosters[0].status` 是否为 `boosting`
   - 获取 `ping`（延迟）和 `packetLoss`（丢包率）

6. **反馈结果**
   - 告知用户加速已启动
   - 展示关键信息：
     - 游戏名称（gameName）
     - 节点名称（nodeName）
     - 延迟（ping）ms
     - 丢包率（packetLoss）%

**示例回复**：
```
✅ 已为您启动 Apex 英雄 的加速
📍 节点：香港节点
⚡ 延迟：35ms
📶 丢包率：0.5%
```

---

### 工作流2：查询加速状态

**适用场景**：用户想知道当前哪些游戏正在加速

**执行步骤**：

1. **（可选）快速环境检查**
   ```bash
   bin\uu-cli.exe --json doctor
   ```

2. **查询所有加速状态**
   ```bash
   bin\uu-cli.exe --json status
   ```

3. **解析并格式化展示**
   - 检查 `data.isBoosting`（是否有加速）
   - 显示 `data.count`（加速游戏数量）
   - 遍历 `data.boosters` 数组，对每个游戏显示：
     - 游戏名（gameName）
     - 区服（regionName）
     - 节点（nodeName）
     - 状态（status）
     - 延迟（ping）
     - 丢包率（packetLoss）

**示例回复**：
```
🎮 当前正在加速 2 款游戏：

1. Apex 英雄 - 亚洲服
   节点：香港节点 | 延迟：35ms | 丢包：0.5%

2. 原神 - 官服
   节点：上海节点 | 延迟：28ms | 丢包：0%
```

---

### 工作流3：停止游戏加速

**适用场景**：用户想要停止某个或所有游戏的加速

**执行步骤**：

1. **查询当前加速状态**
   ```bash
   bin\uu-cli.exe --json status
   ```
   - 检查是否有加速中的游戏
   - 若无加速，提示用户当前没有加速中的游戏

2. **确认停止目标**
   - 若用户明确指定游戏名，提取游戏ID
   - 若用户说"停止所有"或"停止加速"（未指定游戏），询问：
     - 停止所有加速？
     - 还是选择特定游戏？

3. **执行停止**
   ```bash
   # 停止所有
   bin\uu-cli.exe --json stop
   # 或
   bin\uu-cli.exe --json stop --all
   
   # 停止指定游戏
   bin\uu-cli.exe --json stop --id <游戏ID>
   ```

4. **验证已停止**
   - 再次查询状态确认
   ```bash
   bin\uu-cli.exe --json status
   ```

5. **反馈结果**
   - 告知用户停止成功
   - 显示已停止的游戏名称

**示例回复**：
```
✅ 已停止所有游戏的加速
```

---

## 命令参考

详细命令参考请查看 `reference/commands.md`，包含：
- `doctor` - 环境检测
- `games` - 游戏查询
- `start` - 启动加速
- `stop` - 停止加速
- `status` - 状态查询

---

## 错误处理

详细错误处理指南请查看 `reference/errors.md`，包含：
- 常见错误码及含义
- 每种错误的处理方式
- 错误恢复建议

**快速参考**：

| 错误码 | 处理方式 |
|--------|---------|
| UU_NOT_INSTALLED | 提示安装 UU（https://uu.163.com） |
| UU_NOT_RUNNING | 执行 `bin\uu-cli.exe --json start` |
| SERVICE_UNAVAILABLE | 等待 3-5 秒重试或提示重启 UU |
| GAME_NOT_FOUND | 重新搜索或让用户确认游戏名 |

---

## 实现要点

### 1. 命令执行
- 使用 `run_terminal_cmd` 工具执行命令
- 所有命令都带 `--json` 参数以获取结构化输出
- 命令路径使用相对路径 `bin\uu-cli.exe` 或绝对路径

### 2. JSON 解析
- 所有命令返回统一格式：
  ```json
  {
    "success": true/false,
    "data": { ... },      // success=true 时
    "error": { ... }      // success=false 时
  }
  ```
- 必须先检查 `success` 字段再处理数据

### 3. 用户交互
- 使用 `ask_user_question` 工具让用户选择：
  - 多个搜索结果时选择游戏
  - 选择区服
  - 确认停止所有或特定游戏

### 4. 状态验证
- 启动加速后必须验证状态
- 状态可能经历：`starting` → `boosting`
- 需要等待 3-5 秒让状态稳定

### 5. 友好反馈
- 将技术信息转化为用户友好的语言
- 使用 emoji 增强可读性（可选）
- 显示关键指标：延迟、丢包率

---

## 注意事项

1. ⚠️ **始终使用 `--json` 参数**确保输出可解析
2. ⚠️ **先执行 `doctor`** 确认服务可用后再执行其他命令
3. ⚠️ **游戏搜索支持模糊匹配**，中英文皆可
4. ⚠️ **`--zone` 和 `--server` 必须成对**使用或都不使用
5. ⚠️ **`stop` 无参数默认停止所有**加速
6. ⚠️ **加速启动后需等待 3-5 秒**，状态才会从 `starting` 变为 `boosting`
7. ⚠️ **Windows 环境**下使用反斜杠 `\` 作为路径分隔符

---

## 性能预期

| 操作 | 预期耗时 |
|------|---------|
| doctor | < 100ms |
| games --search | 100-500ms |
| start --id | 200-1000ms |
| stop | 100-500ms |
| status | < 200ms |

---

## 示例对话

详细示例请查看 `examples/` 目录：
- `start-game.md` - 启动游戏加速的完整对话
- `check-status.md` - 查询状态的完整对话
- `stop-game.md` - 停止加速的完整对话

---

## 版本历史

### v1.0.0 (2026-03-31)
- ✨ 初始版本
- ✅ 支持游戏搜索
- ✅ 支持启动/停止加速
- ✅ 支持状态查询
- ✅ 支持环境检测
- 📦 包含 uu-cli.exe v1.0.1

---

## 技术规格

| 项目 | 说明 |
|------|------|
| CLI 工具 | uu-cli.exe v1.0.1 |
| 通信协议 | HTTP (localhost) |
| 默认端口 | 15555 |
| 输出格式 | JSON |
| 支持平台 | Windows 10/11 (x64) |

---

## 许可与支持

本 skill 依赖网易UU加速器客户端，使用前请确保已安装官方客户端。

- 官方网站：https://uu.163.com
- CLI 工具版本：1.0.1
- Skill 版本：1.0.0
