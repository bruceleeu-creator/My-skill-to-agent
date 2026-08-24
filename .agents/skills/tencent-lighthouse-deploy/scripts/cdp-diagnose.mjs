/** 连 EXE 的 CDP 调试端口，抓渲染进程真实状态（Node 22+ 自带 WebSocket） */
const PORT = 9223

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
  const page = list.find((t) => t.type === 'page')
  if (!page) {
    console.log('没有 page target:', list.map((t) => `${t.type}:${t.title}`).join(', '))
    return
  }
  console.log('target url:', page.url)

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })

  let id = 0
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = ++id
      const onMsg = (ev) => {
        const m = JSON.parse(ev.data)
        if (m.id === msgId) { ws.removeEventListener('message', onMsg); resolve(m.result) }
      }
      ws.addEventListener('message', onMsg)
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  const logs = []
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    if (m.method === 'Runtime.exceptionThrown') logs.push('异常: ' + JSON.stringify(m.params.exceptionDetails).slice(0, 400))
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('console.error: ' + JSON.stringify(m.params.args).slice(0, 300))
    if (m.method === 'Log.entryAdded') logs.push(`log(${m.params.entry.level}): ${m.params.entry.text} ${m.params.entry.url || ''}`)
  })

  await send('Runtime.enable')
  await send('Log.enable')

  const evalStr = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
    return r.result?.value ?? JSON.stringify(r.result?.description ?? r)
  }

  console.log('root.innerHTML 长度:', await evalStr('document.getElementById("root") ? document.getElementById("root").innerHTML.length : "无root节点"'))
  console.log('body 子元素数:', await evalStr('document.body.children.length'))
  console.log('脚本标签:', await evalStr('Array.from(document.scripts).map(s => s.src || s.textContent.slice(0,50)).join(" | ")'))
  console.log('资源加载情况:', await evalStr(`performance.getEntriesByType('resource').map(r => r.name.split('/').pop() + ':' + (r.responseStatus ?? r.duration.toFixed(0) + 'ms')).join('  ') || '无资源记录'`))
  console.log('JS 执行时长(ms):', await evalStr('performance.now().toFixed(0)'))

  await new Promise((r) => setTimeout(r, 1500))
  console.log('--- 收集到的错误/日志 ---')
  console.log(logs.length ? logs.join('\n') : '(无)')
  ws.close()
}

main().catch((e) => { console.error('诊断失败:', e.message); process.exit(1) })
