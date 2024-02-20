'use client';
import React, { useState } from 'react';
import {
  Address,
  createWalletClient,
  custom,
  createPublicClient,
  http,
  formatEther,
} from 'viem';
import { polygonMumbai } from 'viem/chains';
import AccountFactoryABI from '../abi/AccountFactory.json';
import SmartWalletAccountABI from '../abi/Account.json';

export default function ConnectWalletButton() {
  const [account, setAccount] = useState<Address>();
  const [smartWallet, setSmartWallet] = useState<Address>();
  const [walletClient, setWalletClient] = useState<any>();
  const [publicClient, setPublicClient] = useState<any>();
  const [balance, setBalance] = useState<any>();
  const [accountStatus, setAccountStatus] = useState<boolean>(true);

  const getViemWalletClient = async () => {
    const walletClient = createWalletClient({
      chain: polygonMumbai,
      transport: custom(window.ethereum!),
    });

    const publicClient = createPublicClient({
      chain: polygonMumbai,
      transport: http(),
    });

    await walletClient.switchChain({ id: polygonMumbai.id });

    const [eoaWallet] = await walletClient.requestAddresses();
    setAccount(eoaWallet);
    setWalletClient(walletClient);
    setPublicClient(publicClient);
  };

  const createAccount = async () => {
    const { request } = await publicClient.simulateContract({
      address: '0x272Eb3dA5A96421555f02f7175020143eA7542C9',
      abi: AccountFactoryABI,
      functionName: 'createAccount',
      args: [account, ''],
      account: account,
    });

    const hash = await walletClient.writeContract(request);
    const transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    console.log(transactionReceipt);
    getSmartWalletAddress();
  };

  const getSmartWalletAddress = async () => {
    const data = await publicClient.readContract({
      address: '0x272Eb3dA5A96421555f02f7175020143eA7542C9',
      abi: AccountFactoryABI,
      functionName: 'getAllAccounts',
    });

    console.log(data);

    //@ts-ignore
    if (data && data?.length > 0) {
      setSmartWallet(data[0]);
    }
  };

  const getSmartWalletBalance = async () => {
    const balance = await publicClient.getBalance({
      address: String(smartWallet),
      blockTag: 'latest',
    });
    setBalance(formatEther(balance));
  };

  const deactivateAccount = async () => {
    const { request } = await publicClient.simulateContract({
      address: String(smartWallet),
      abi: SmartWalletAccountABI,
      functionName: 'deactivateSmartWallet',
      account: account,
    });

    const hash = await walletClient.writeContract(request);
    const transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash,
    });
    console.log(transactionReceipt);

    if (transactionReceipt.status) {
      setAccountStatus(false);
    }
  };

  return (
    <div>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <button
          className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
          onClick={getViemWalletClient}
        >
          {account
            ? 'Admin(EOA): ' + account
            : 'Get started by connecting wallet'}
        </button>
        <button
          className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
          onClick={createAccount}
        >
          {smartWallet ? 'Smart Wallet: ' + smartWallet : 'Create Smart Wallet'}
        </button>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"></div>
      </div>
      <br />
      <button
        className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        onClick={getSmartWalletBalance}
      >
        Balance: {balance} 🔁
      </button>

      <button
        className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        onClick={deactivateAccount}
      >
        {accountStatus ? 'Deactivate Account' : 'Account Deactivated'}
      </button>
    </div>
  );
}
