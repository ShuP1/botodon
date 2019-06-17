import Logger from "./Logger";

export default class Limiter {

  private past: number[] = []
  private queue: any[] = []
  private timer: NodeJS.Timeout | NodeJS.Immediate = null

  constructor(private calls: number, private time: number, private sync: boolean = false) { }

  dequeue() {
    const now = Date.now()

    this.past = this.past.filter(t => now - t < this.time)

    while (this.past.length < this.calls && this.queue.length > 0) {
      this.past.push(now)
      const action = this.queue.shift()
      action()

      if (this.sync) {
        break
      }
    }

    if (this.queue.length <= 0) {
      this.timer = null
    } else {
      const delay = this.sync ? this.time / this.calls : this.time - now + this.past[0]
      Logger.warn(`Limiter: waiting ${delay}ms...`)
      this.timer = setTimeout(this.dequeue.bind(this), delay)
    }
  }

  limit(callback: CallableFunction) {
    this.queue.push(callback)
    if (this.timer === null) {
      this.timer = setImmediate(this.dequeue.bind(this))
    }
  }

  promise<T>(promise: Promise<T>) {
    let res: (value?: T) => void = null
    let rej: (reason?: any) => void = null
    const wrapper = new Promise<T>((resolve, reject) => {
      res = resolve
      rej = reject
    })
    this.limit(() => promise.then(res).catch(rej))
    return wrapper
  }
}