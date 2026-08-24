# 网易UU加速器控制 Skill

通过命令行工具控制网易UU游戏加速器，支持游戏加速的启动、停止和状态查询。

---

## 📦 Skill 信息

- **名称**：netease-uu-booster
- **版本**：1.0.0
- **平台**：Windows 10/11 (x64)
- **依赖**：网易UU加速器客户端

---

## 📁 目录结构

```
netease-uu-booster/
├── SKILL.md              # Skill 定义文档（主要文档）
├── README.md             # 本文档
├── bin/
│   └── uu_cli.exe        # UU加速器CLI工具 (v1.0.1)
├── reference/
│   ├── commands.md       # 命令参考文档
│   └── errors.md         # 错误处理指南
└── examples/
    ├── start-game.md     # 启动游戏加速示例
    ├── check-status.md   # 查询状态示例
    └── stop-game.md      # 停止加速示例
```

---

## 🚀 快速开始

### 前置条件

1. **安装 UU 加速器**
   - 访问：https://uu.163.com
   - 下载并安装客户端
   - 启动 UU 加速器

2. **CLI 工具已包含**
   - `bin/uu_cli.exe` 已包含在本 skill 中
   - 无需额外安装

### 使用示例

#### 示例1：为游戏启动加速
```
用户：帮我加速 Apex

AI 执行：
1. bin\uu_cli.exe --json doctor           # 检查环境
2. bin\uu_cli.exe --json games --search "Apex"  # 搜索游戏
3. bin\uu_cli.exe --json start --id 10642       # 启动加速
4. bin\uu_cli.exe --json status --id 10642      # 验证状态

AI 回复：
✅ 已为您启动 Apex 英雄 的加速
📍 节点：香港节点
⚡ 延迟：35ms
📶 丢包率：0.5%
```

#### 示例2：查询加速状态
```
用户：现在加速了什么游戏？

AI 执行：
bin\uu_cli.exe --json status

AI 回复：
🎮 当前正在加速 2 款游戏：
1. Apex 英雄 - 延迟：35ms | 丢包：0.5%
2. 原神 - 延迟：28ms | 丢包：0%
```

#### 示例3：停止加速
```
用户：停止所有加速

AI 执行：
bin\uu_cli.exe --json stop

AI 回复：
✅ 已停止所有游戏的加速
```

---

## 📖 文档导航

### 核心文档
- **[SKILL.md](SKILL.md)** - Skill 完整定义，包含工作流、命令规范、实现要点

### 参考文档
- **[commands.md](reference/commands.md)** - 所有命令的详细参数和返回格式
- **[errors.md](reference/errors.md)** - 错误码说明和处理建议

### 示例文档
- **[start-game.md](examples/start-game.md)** - 启动游戏加速的5个场景示例
- **[check-status.md](examples/check-status.md)** - 查询加速状态的6个场景示例
- **[stop-game.md](examples/stop-game.md)** - 停止游戏加速的6个场景示例

---

## 🎯 主要功能

### 1. 环境检测
- 检查 UU 是否安装
- 检查 UU 是否运行
- 检查服务是否可用

### 2. 游戏搜索
- 支持中英文搜索
- 支持模糊匹配
- 获取游戏区服信息

### 3. 启动加速
- 基本加速（自动选择节点）
- 指定区服加速
- 自动启动 UU（如未运行）

### 4. 状态查询
- 查询所有加速中的游戏
- 查询指定游戏状态
- 显示延迟和丢包率

### 5. 停止加速
- 停止所有加速
- 停止指定游戏加速
- 批量停止多个游戏

---

## ⚡ 核心工作流

### 工作流1：启动游戏加速
```
1. 环境检测 (doctor)
2. 搜索游戏 (games --search)
3. 启动加速 (start --id)
4. 验证状态 (status)
5. 反馈结果
```

### 工作流2：查询加速状态
```
1. 查询状态 (status)
2. 解析并格式化展示
```

### 工作流3：停止游戏加速
```
1. 查询当前状态
2. 确认停止目标
3. 执行停止 (stop)
4. 验证已停止
5. 反馈结果
```

详细流程请参考 [SKILL.md](SKILL.md)

---

## 🛠 技术规格

| 项目 | 说明 |
|------|------|
| CLI 工具 | uu_cli.exe v1.0.1 |
| 通信协议 | HTTP (localhost) |
| 默认端口 | 15555 |
| 输出格式 | JSON |
| 编码 | UTF-8 |
| 支持平台 | Windows 10/11 (x64) |

---

## 📋 命令速查

| 命令 | 用途 | 示例 |
|------|------|------|
| `doctor` | 环境检测 | `bin\uu_cli.exe --json doctor` |
| `games --search` | 搜索游戏 | `bin\uu_cli.exe --json games --search "Apex"` |
| `games --id` | 获取详情 | `bin\uu_cli.exe --json games --id 10642` |
| `start --id` | 启动加速 | `bin\uu_cli.exe --json start --id 10642` |
| `stop` | 停止所有 | `bin\uu_cli.exe --json stop` |
| `stop --id` | 停止指定 | `bin\uu_cli.exe --json stop --id 10642` |
| `status` | 查询所有 | `bin\uu_cli.exe --json status` |
| `status --id` | 查询指定 | `bin\uu_cli.exe --json status --id 10642` |

完整命令参考：[commands.md](reference/commands.md)

---

## ⚠️ 注意事项

1. **始终使用 `--json` 参数**确保输出可解析
2. **先执行 `doctor`** 确认服务可用后再执行其他命令
3. **游戏搜索支持模糊匹配**，中英文皆可
4. **`--zone` 和 `--server` 必须成对**使用
5. **加速启动后需等待 3-5 秒**，状态才会稳定
6. **Windows 环境**下使用反斜杠 `\` 作为路径分隔符

---

## 🐛 常见问题

### Q: 显示 "UU Booster is not running"？
**A**: 自动启动 UU：
```bash
bin\uu_cli.exe --json start
```
等待 5 秒后重试原命令

### Q: 显示 "Service unavailable"？
**A**: 
1. 等待 3-5 秒后重试（UU 可能正在启动）
2. 手动重启 UU 客户端
3. 检查防火墙设置

### Q: 搜索不到游戏？
**A**:
1. 检查游戏名称拼写
2. 使用更简短的关键词（如 "Apex" 而不是 "Apex英雄"）
3. 确认游戏是否在 UU 支持列表中

更多问题排查：[errors.md](reference/errors.md)

---

## 📊 性能预期

| 操作 | 预期耗时 |
|------|---------|
| doctor | < 100ms |
| games --search | 100-500ms |
| start --id | 200-1000ms |
| stop | 100-500ms |
| status | < 200ms |

---

## 📝 版本历史

### v1.0.0 (2026-03-31)
- ✨ 初始版本
- ✅ 支持游戏搜索
- ✅ 支持启动/停止加速
- ✅ 支持状态查询
- ✅ 支持环境检测
- 📦 包含 uu_cli.exe v1.0.1
- 📚 完整文档和示例

---

## 📄 许可与支持

本 skill 依赖网易UU加速器客户端，使用前请确保已安装官方客户端。

- **官方网站**：https://uu.163.com
- **CLI 工具版本**：1.0.1
- **Skill 版本**：1.0.0

---

## 🤝 贡献

欢迎提交问题和改进建议！

---

## 📚 相关链接

- [网易UU加速器官网](https://uu.163.com)
- [SKILL.md - 完整 Skill 定义](SKILL.md)
- [命令参考文档](reference/commands.md)
- [错误处理指南](reference/errors.md)

---

**Made with ❤️ for gamers**
