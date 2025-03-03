import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadDonation, ThanksATon } from '../contracts/thanksATon';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, toNano } from '@ton/core';
import { useTonConnect } from './useTonConnect';
import { sleep } from '../utils';
import { type Network } from '@orbs-network/ton-access';
import useRetry from './useRetry';

export type ThankT = {
  hash: string;
  value: number;
  message: string
}

export function useCounterContract(network: Network, address: string) {
  const client = useTonClient(network);
  const [val, setVal] = useState<null | number>();
  const { sender } = useTonConnect();

  const [thanks, setThanks] = useState<ThankT[]>([]);

  const thanksATonContract = useMemo(() => {
    if (!client) return;
    const contract = ThanksATon.fromAddress(
      Address.parse(address) // replace with your address from tutorial 2 step 8
    );
    return client.open(contract)  // as OpenedContract<ThanksATon>;
  }, [client]);

  const getThanks = useRetry(async () => {
    const donations: ThankT[] = []
    if (!thanksATonContract) return donations;
    let transactions;
      transactions = await client?.getTransactions(thanksATonContract.address!, { limit: 10 })
    if (transactions) {
      for (const tx of transactions) {
        if (tx.inMessage?.info.type === 'internal') {
          const value = tx.inMessage.info.value.coins;
          const body = tx.inMessage.body.beginParse();

          try {
            const msg = loadDonation(body)
            donations.push({
              hash: tx.hash().toString(),
              message: msg.message,
              value: Number(value * 100n / 1000000000n) / 100
            })
          } catch { }
        }
      }
    }

    setThanks(donations);
  }, 3,[thanksATonContract, setThanks])

  const getValue = useRetry(
    async function getValue() {
      if (!thanksATonContract) return;
      const val = await thanksATonContract.getBalance();
      setVal(Number(val));
    }
    , 3,[thanksATonContract, setVal]);

  useEffect(() => {
    Promise.all([getValue(), getThanks()]);
  }, [thanksATonContract,]);

  return {
    value: val,
    address: thanksATonContract?.address.toString(),
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
          if (state?.balance !== newState?.balance) {
            await sleep(1500);
            break;
          }
          await sleep(2000);
        }

        await Promise.all([getValue(), getThanks()]);
      } catch (err) {
        console.error('Error:', err)
      }
    },
  };
}
