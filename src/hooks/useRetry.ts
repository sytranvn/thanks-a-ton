import { useCallback } from "react";
import { sleep } from "../utils";

export default function useRetry(func: Function, retries: number = 3, deps: any[]) {
  const retryable = useCallback(async () => {
    let count = 0;
    while (count < retries) {
      try {
        count++;
        const inter = func();
        if (inter instanceof Promise) {
          return await inter
        }
        return inter
      } catch (err) {
        if (count < retries) {
          console.warn(`Retrying ${func.name || 'function'} ${count}/${retries}`, err)
          await sleep(1500 * (1 << count));
        }
        else {
          throw err;
        }
      }
    }
  }, [func, retries, ...deps])
  return retryable;
}
