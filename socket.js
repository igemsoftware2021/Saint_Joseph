/**
 * Very "complex" reload system
 */
const ws = new WebSocket("ws://localhost:5050")

ws.onmessage = () => location.reload()