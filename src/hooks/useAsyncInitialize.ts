import { useEffect, useState } from 'react';

export function useAsyncInitialize<T>(func: () => Promise<T>) {
  const [state, setState] = useState<T | undefined>();
  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, [func]);

  return state;
}
