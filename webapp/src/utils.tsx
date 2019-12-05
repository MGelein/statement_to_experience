import { useEffect, useRef } from 'react'

export const useInterval = (callback: any, delay: number) => {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      (savedCallback as any).current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export const debounce = (fn: any, delay: number) => {
  let timeoutId: number;
  return function(...args: any) {
    clearInterval(timeoutId);
    timeoutId = setTimeout(() => fn.apply(args), delay); // this, 
  };
};
