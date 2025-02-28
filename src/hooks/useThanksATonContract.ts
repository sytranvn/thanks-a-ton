import { useCallback, useEffect, useState } from 'react';
import { loadDonation, ThanksATon } from '../contracts/thanksATon';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, toNano } from '@ton/core';
import { useTonConnect } from './useTonConnect';
import { sleep } from '../utils';
import { type Network } from '@orbs-network/ton-access';

export type ThankT = {
  hash: string;
  value: number;
  message: string
}

const address = import.meta.env.VITE_APP_CONTRACT_ADDRESS

export function useCounterContract(network: Network) {
  const client = useTonClient(network);
  const [val, setVal] = useState<null | number>();
  const { sender } = useTonConnect();

  const [thanks, setThanks] = useState<ThankT[]>([]);

  const thanksATonContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = ThanksATon.fromAddress(
      Address.parse(address) // replace with your address from tutorial 2 step 8
    );
    return client.open(contract)  // as OpenedContract<ThanksATon>;
  }, [client]);

  const getThanks = useCallback(async () => {
    const donations: ThankT[] = []
    if (!thanksATonContract) return donations;
    let transactions;
    try {
      transactions = await client?.getTransactions(thanksATonContract.address!, { limit: 10 })
    } catch {
      await sleep(3000);
      transactions = await client?.getTransactions(thanksATonContract.address!, { limit: 10 })
    }

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
  }, [thanksATonContract, setThanks, client])

  const getValue = useCallback(
    async function getValue() {
      if (!thanksATonContract) return;
      try {
        const val = await thanksATonContract.getBalance();
        setVal(Number(val));
      } catch {
        await sleep(3000);
        const val = await thanksATonContract.getBalance();
        setVal(Number(val));
      }
    }
    , [thanksATonContract, setVal]);

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
