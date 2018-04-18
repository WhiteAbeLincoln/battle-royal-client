declare module 'fscreen' {
  interface Fscreen {
    fullscreenEnabled: boolean,
    fullscreenElement: HTMLElement,
    requestFullscreen: (elem: HTMLElement) => void,
    requestFullscreenFunction: (elem: HTMLElement) => void,
    exitFullscreen: () => void,
    onfullscreenchange: (ev: Event) => void,
    addEventListener: (name: 'fullscreenchange', ev: Event, options: {}) => void,
    removeEventListener: (name: 'fullscreenchange', ev: Event, options: {}) => void,
    onfullscreenerror: (ev: Event) => void,
    addEventListener: (name: 'fullscreenerror', ev: Event, options: {}) => void,
    removeEventListener: (name: 'fullscreenerror', ev: Event, options: {}) => void,
  };

  export default Fscreen
}