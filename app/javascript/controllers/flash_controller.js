import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    console.log('Flash controller!')
  }

  remove() {
    this.element.remove()
  }
}