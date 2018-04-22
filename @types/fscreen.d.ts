declare module 'fscreen' {
  interface Fscreen {
    fullscreenEnabled: boolean,
    fullscreenElement: HTMLElement,
    requestFullscreen: (elem: HTMLElement) => void,
    requestFullscreenFunction: (elem: HTMLElement) => void,
    exitFullscreen: () => void,
    onfullscreenchange: (ev: Event) => void,
    addEventListener: (name: 'fullscreenchange' | 'fullscreenerror', ev: Event, options: {}) => void,
    removeEventListener: (name: 'fullscreenchange' | 'fullscreenerror', ev: Event, options: {}) => void,
    onfullscreenerror: (ev: Event) => void,
  }

  const fscreen: Fscreen

  export default fscreen
}