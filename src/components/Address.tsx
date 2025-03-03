import { memo, useCallback, useState } from "react";

type Props = {
  network: string;
  address: string;
}

function Address({ network, address }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address!);
      setCopied(true);
      setTimeout(() => { setCopied(false) }, 1000);
    } catch (err) {
      console.error("Please copy this address: " + address!)
    }
  }, [address])

  return <>
            <b>Send Thanks to Address {network === 'testnet' && '(testnet)'}</b>
            <pre className='Hint' onClick={copyAddress}>{address}</pre>
            <span className={`Copied ${!copied && 'Faded'}`}>Copied</span>
  </>
}

export default memo(Address);
