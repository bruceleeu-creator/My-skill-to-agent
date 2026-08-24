# My-skill-to-agent

个人 AI 编程技能库（skills）跨设备同步仓库，配合 [dave1010/skills-to-agents](https://github.com/dave1010/skills-to-agents) 使用。

## 结构

- `.agents/skills/<name>/SKILL.md` — 全部 skill（单一事实来源，120 个）
- `AGENTS.md` — 由 skills-to-agents 自动生成的技能清单（勿手改）
- `.github/workflows/update-agents-skills.yml` — 推送后 CI 自动重建 AGENTS.md

## 新设备同步步骤

```bash
# 1. 克隆本仓库
git clone https://github.com/bruceleeu-creator/My-skill-to-agent.git

# 2. 把 skill 复制到本机 ZCode 技能目录（真实副本，不用符号链接）
#    Windows (Git Bash):
cp -r .agents/skills/* /c/Users/<用户名>/.zcode/skills/
#    macOS / Linux:
cp -r .agents/skills/* ~/.zcode/skills/

# 3. 安装 skills-to-agents 并重建本机 AGENTS.md 清单
npm install -g github:dave1010/skills-to-agents 2>/dev/null || \
  git clone https://github.com/dave1010/skills-to-agents && cd skills-to-agents && npm install -g .
cd ~/.zcode && skills-to-agents --skills-dir skills --agents-path AGENTS.md --write
```

## 本机改动后推送（Windows 主机）

```bash
cd C:/Users/Administrator/My-skill-to-agent
node -e "require('fs').cpSync('C:/Users/Administrator/.zcode/skills/.', '.agents/skills', {recursive:true})"
skills-to-agents --write   # 在仓库根目录运行，默认读 .agents/skills
git add -A && git commit -m "sync: update skills" && git push
```

## 约定

- 主机（Windows）上不安装 `mp-*`（Matt Pocock 系列）与 superpowers 系列（`using-superpowers`、`brainstorming`、`writing-plans`、`systematic-debugging`、`test-driven-development`、`requesting-code-review`、`grill-me`、`grill-with-docs`、`improve-codebase-architecture`）——主人已明确删除过；仓库仅作存档。
- skill 一律真实目录副本，不使用跨工具符号链接。
- 每个 skill 必须有带 `name` + `description` 的 frontmatter，否则 skills-to-agents 会报错。
