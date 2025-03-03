import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadDonation, ThanksATon } from '../contracts/thanksATon';
import { useTonClient } from './useTonClient';
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
  }, [client, address]);

  const getThanks = useCallback(async () => {
    const donations: ThankT[] = []
    if (!thanksATonContract) return donations;
    const transactions = await client?.getTransactions(thanksATonContract.address!, { limit: 100 })
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
          } catch {
            // noop
          }
        }
      }
    }

    setThanks(donations);
  }, [thanksATonContract, setThanks, client])
  const getThanksRetry = useRetry(getThanks, 3)

  const getValue = useCallback(
    async function getValue() {
      if (!thanksATonContract) return;
      const val = await thanksATonContract.getBalance();
      setVal(Number(val));
    }
    , [thanksATonContract, setVal]);

  const getValueRetry = useRetry(getValue, 3)
  useEffect(() => {
    getValueRetry().then(() => getThanksRetry())
  }, [getValueRetry, getThanksRetry]);

  const sendThanks = useCallback(async (amount: number, message: string) => {
    if (!thanksATonContract) return;
    const state = await client?.getContractState(thanksATonContract.address)
    try {
      await thanksATonContract?.send(sender, { value: toNano(amount), bounce: true }, {
        $$type: 'Donation',
        message,
      });
      while (true) {
        const newState = await client?.getContractState(thanksATonContract.address)
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
  }, [client, sender, thanksATonContract, getValue, getThanks]
  );

  return {
    value: val,
    address: thanksATonContract?.address.toString(),
    thanks,
    sendThanks
  };
}
