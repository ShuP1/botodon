export default class Selector<T> {

  private last: T
  private index: number[]

  constructor(private list: T[], private same: boolean, weight: (el: T) => number) {
    this.index = list.map((s, idx) => Array(weight(s)).fill(idx)).reduce((a, b) => a.concat(b))
  }

  next() {
    if (this.same) {
      if (this.last === undefined) {
        this.last = this.select()
      }
      return this.last
    }
    return this.select()
  }

  private select() {
    return this.list[this.index[Math.floor(Math.random() * this.index.length)]]
  }

}