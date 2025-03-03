import { ChangeEvent, memo } from "react";

type Props = {
  changeAmount: (event: ChangeEvent<HTMLInputElement>) => void;
  amount: number;
  message: string;
  changeMessage: (event: ChangeEvent<HTMLInputElement>) => void;
}
function SendThanks({ changeAmount, amount, message, changeMessage }: Props) {

  return <>
    <div><b>Send a thanks</b></div>
    <label htmlFor="amount">Ton amount: </label>
    <div><input id="amount" type="number" min={1} max={5} step={0.1} value={amount} onChange={changeAmount} /></div>
    <label htmlFor="message">Message: </label>
    <div><input id="message" type="text" maxLength={100} value={message} onChange={changeMessage} /></div>
  </>
}

export default memo(SendThanks);
