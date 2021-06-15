const ws = new WebSocket("ws://localhost:5050")

ws.onmessage = () => location.reload()