export class AsyncLock {
  private isLocked: boolean
  private waitingQueue: Array<() => void>

  constructor() {
    this.isLocked = false
    this.waitingQueue = []
  }

  async acquire(): Promise<void> {
    if (!this.isLocked) {
      this.isLocked = true
      return Promise.resolve()
    } else {
      return new Promise<void>((resolve) => {
        this.waitingQueue.push(resolve)
      })
    }
  }

  release() {
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift()
      if (next) {
        next()
      }
    } else {
      this.isLocked = false
    }
  }
}