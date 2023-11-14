// https://stackoverflow.com/a/326076/11258480
export const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
