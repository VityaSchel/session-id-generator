self.addEventListener('message', async (event) => {
  self.postMessage(event.data)
})
