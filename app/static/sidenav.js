const nav = document.getElementById('sidenav')
const menuBtn = document.getElementById('menu')
const closeBtn = document.getElementById('close-btn')

export default class Sidenav {
  static nav = nav
  static menuBtn = menuBtn
  static closeBtn = closeBtn
  static navOpen = false

  static init() {
    this.menuBtn.addEventListener('click', () => { this.openNav() })
    this.closeBtn.addEventListener('click', () => { this.closeNav() })
  }
  static openNav() {
    this.nav.style.transform = "translate(200px, 0)"
    this.navOpen = true
  }
  static closeNav() {
    this.nav.style.transform = "translate(-200px, 0)"
    this.navOpen = false
  }
}
