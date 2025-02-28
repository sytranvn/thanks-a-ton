import { useCallback, useEffect, useState } from 'react';
import { loadDonation, ThanksATon } from '../contracts/thanksATon';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, OpenedContract, toNano } from '@ton/core';
import { useTonConnect } from './useTonConnect';
import { sleep } from '../utils';

type Thank = {
  hash: string;
  value: number;
  message: string
}

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | number>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { sender } = useTonConnect();

  const [thanks, setThanks] = useState<Thank[]>([]);

  const thanksATonContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = ThanksATon.fromAddress(
      Address.parse('EQB3eoFOxFl6smzvdCdltuIGnYz3Segp5UZVSqZ6S0GZbACy') // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<ThanksATon>;
  }, [client]);

  const getThanks = useCallback(async () => {
    const donations: Thank[] = []
    if (!thanksATonContract) return donations;
    const transactions = await client?.getTransactions(thanksATonContract.address!, { limit: 10 })

    if (transactions) {
      for (const tx of transactions) {
        if (tx.inMessage?.info.type === 'internal') {
          const value = tx.inMessage.info.value.coins;
          const body = tx.inMessage.body.beginParse();

          try {
            const msg = loadDonation(body)
            donations.push({
              hash: tx.hash.toString(),
              message: msg.message,
              value: Number(value * 100n / 1000000000n) / 100
            })
          } catch { }
        }
      }
    }

    console.log(donations)
    setThanks(donations);
  }, [thanksATonContract])

  useEffect(() => {
    async function getValue() {
      if (!thanksATonContract) return;
      const val = await thanksATonContract.getBalance();
      setVal(Number(val));
    }
    async function getIsOwner() {
      if (!thanksATonContract) return false;
      const isOwner = await thanksATonContract.getIsOwner(sender.address!);
      setIsOwner(isOwner)
    }

    Promise.all([getValue(), getIsOwner(), getThanks()]);
  }, [thanksATonContract]);

  return {
    value: val,
    address: thanksATonContract?.address.toString(),
    isOwner,
    thanks,
    sendThanks: async (amount: number, message: string) => {
      const state = await client?.getContractState(thanksATonContract?.address!)
      try {
        await thanksATonContract?.send(sender, { value: toNano(amount), bounce: true }, {
          $$type: 'Donation',
          message,
        });
        while (true) {
          const newState = await client?.getContractState(thanksATonContract?.address!)
          if (state?.blockId.seqno !== newState?.blockId.seqno) {
            break;
          }
          await sleep(1500);
        }

        const val = await thanksATonContract?.getBalance();
        setVal(Number(val));
      } catch (err) {
        console.error('Error:', err)
      }
    },
  };
}
