import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useCounterContract } from './hooks/useThanksATonContract'
import { useTonConnect } from './hooks/useTonConnect';
import { ChangeEvent, useCallback, useState } from 'react';

function App() {
  const { connected } = useTonConnect();
  const { value, address, sendThanks, thanks } = useCounterContract();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');

  const changeAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAmount(+event.target.value)
  }, [setAmount])
  const changeMessage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }, [setMessage])

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address!);
      setCopied(true);
      setTimeout(() => { setCopied(false) }, 1000);
    } catch (err) {
      console.error("Please copy this address: " + address!)
    }
  }, [address])

  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />

        <div className='Card Address' style={{ position: 'relative' }}>
          <b>Send Thanks to Address {import.meta.env.VITE_APP_NETWORK === 'testnet' && '(testnet)'}</b>
          <pre className='Hint' onClick={copyAddress}>{address}</pre>
          <span className={`Copied ${!copied && 'Faded'}`}>Copied</span>
          <b>Current balance</b>
          <div>{value ?? 'Loading...'}</div>

          <b>Received Thanks</b>
          <div>
            <ul className='Thanks'>{
              thanks.map(thank => (
                  <li key={thank.hash}>"{thank.message}" with {thank.value} 💎 </li>
              ))
            }
            </ul>
          </div>
        </div>

        <div className='Card'>
          <b>Ton amount: </b>
          <div><input type="number" min={1} max={5} step={0.1} value={amount} onChange={changeAmount} /></div>
          <b>Message: </b>
          <div><input type="text" maxLength={100} value={message} onChange={changeMessage} /></div>
        </div>

        <button className='Send' disabled={!connected} onClick={() => sendThanks(amount, message)}>Send</button>

    </div>
    </div >
  );
}
export default App
