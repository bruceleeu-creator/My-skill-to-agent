---
name: skills-to-agents
description: 同步 skill 清单到 AGENTS.md（skills-to-agents CLI 的调用壳）。用户增删改 ~/.zcode/skills 里的 skill 后、说「同步 skill 清单 / 更新 AGENTS.md / 刷新技能列表」时使用。Sync the AGENTS.md skills index by running the skills-to-agents CLI.
---

# skills-to-agents 同步壳

本机已全局安装 [dave1010/skills-to-agents](https://github.com/dave1010/skills-to-agents) CLI（仓库在 `C:\Users\Administrator\.zcode\skills-to-agents\`，零依赖，Node ≥18）。作用：扫描 skill 目录、解析每个 `SKILL.md` 的 frontmatter，在 `AGENTS.md` 的 `<skills>...</skills>` 块里生成/更新清单。

## 标准用法（本机 ZCode 技能库）

```bash
cd C:/Users/Administrator/.zcode
skills-to-agents --skills-dir skills --agents-path AGENTS.md        # dry-run 预览
skills-to-agents --skills-dir skills --agents-path AGENTS.md --write # 实际写入
```

无变化时输出 "already up to date"，可放心重复执行（幂等）。

## 硬性规则（违反即报错/漏项）

- 每个 skill 子目录必须有 `SKILL.md`，frontmatter 必须含 `name` 和 `description`，缺任一则整个命令报错退出
- **符号链接会被静默跳过**（不报错）——清单缺条目时先查目录是不是链接
- 目标 `AGENTS.md` 必须已存在，不存在要先创建
- 生成的链接是相对运行目录的路径，务必在 AGENTS.md 所在目录执行

## 其他场景

- 任意项目仓库：在项目根目录跑 `skills-to-agents`（默认读 `.agents/skills`，写 `AGENTS.md`），或用官方 GitHub Action（模板见仓库 README）实现推送自动同步
- 命令帮助：`skills-to-agents --help`
