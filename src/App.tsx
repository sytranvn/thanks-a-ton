import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useCounterContract } from './hooks/useThanksATonContract'
import { useTonConnect } from './hooks/useTonConnect';
import { ChangeEvent, useCallback, useState } from 'react';
import Card from './components/Card';
import Thanks from './components/Thanks';
import Info from './components/Info';
const network = import.meta.env.VITE_APP_NETWORK

function App() {
  const { connected } = useTonConnect();
  const { value, address, sendThanks, thanks } = useCounterContract(network);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');

  const changeAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAmount(+event.target.value)
  }, [setAmount])
  const changeMessage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }, [setMessage])
  const send = useCallback(async () => {
    await sendThanks(amount, message);
  }, [amount, message])

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

        <Card className='Address'>
          <Info>
            <b>Send Thanks to Address {network === 'testnet' && '(testnet)'}</b>
            <pre className='Hint' onClick={copyAddress}>{address}</pre>
            <span className={`Copied ${!copied && 'Faded'}`}>Copied</span>
          </Info>
          <Info>
            <b>Received TON</b>
            <div>{value ?? 'Loading...'}</div>
          </Info>
          <Info>
            <b>Received Thanks</b>
            <Thanks thanks={thanks} />
          </Info>
        </Card>

        <Card>
          <div><b>Send a thanks</b></div>
          <label htmlFor="amount">Ton amount: </label>
          <div><input id="amount" type="number" min={1} max={5} step={0.1} value={amount} onChange={changeAmount} /></div>
          <label htmlFor="message">Message: </label>
          <div><input id="message" type="text" maxLength={100} value={message} onChange={changeMessage} /></div>
        </Card>

        <button className='Send' disabled={!connected} onClick={send}>Send</button>

      </div>
    </div >
  );
}
export default App
