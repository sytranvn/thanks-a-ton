import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useCounterContract } from './hooks/useThanksATonContract'
import { useTonConnect } from './hooks/useTonConnect';
import { ChangeEvent, useCallback, useState } from 'react';
import Card from './components/Card';
import Thanks from './components/Thanks';
import Info from './components/Info';
import Address from './components/Address';
import SendThanks from './components/SendThanks';
import config from './config';

function App() {
  const { connected } = useTonConnect();
  const { value, sendThanks, thanks } = useCounterContract(config.network, config.address);
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
  }, [amount, message, sendThanks])

  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />

        <Card className='Address'>
          <Info>
            <Address address={config.address!} network={config.network} />
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
          <SendThanks amount={amount} message={message} changeAmount={changeAmount} changeMessage={changeMessage} />
        </Card>

        <button className='Send' disabled={!connected} onClick={send}>Send</button>

      </div>
    </div >
  );
}
export default App
