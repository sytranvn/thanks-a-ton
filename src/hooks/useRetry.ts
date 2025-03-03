import { useCallback } from "react";
import { sleep } from "../utils";

export default function useRetry(func: Function, retries: number = 3, deps: any[]) {
  const retryable = useCallback(async () => {
    let count = 0;
    while (count < retries) {
      try {
        count++;
        return func();
      } catch (err) {
        if (count < retries) {
          console.warn(`Retrying ${func.name} ${count}/${retries}`, err)
          await sleep(500 * count);
        }
        else {
          throw err;
        }
      }
    }
  }, [func, retries, ...deps])
  return retryable;
}
