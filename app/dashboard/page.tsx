"use client";

import React, { useState } from "react";
import { createNexusClient, createBicoPaymasterClient } from "@biconomy/sdk";
import { baseSepolia } from "viem/chains";
import { http, parseEther } from "viem";
import para from "../../para";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

import { ParaEthersV5Signer } from "@getpara/ethers-v5-integration";
import { ethers } from "ethers";

const SignWithBiconomy: React.FC = () => {
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    ""
  );
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [amount, setAmount] = useState<string>("0");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransaction = async () => {
    if (!recipient) {
      alert("Please add recipient address");
      return;
    }
    if (!para.getUserId()) {
      alert("Please connect your Para account.");
      return;
    }
    console.log("the para is ", para.getUserId());

    const userAddress = ethers.Wallet.createRandom([]);
    console.log("user address is ", userAddress);

    setLoading(true);
    try {
      // Create Para ethers signer
      const provider = new ethers.providers.JsonRpcProvider(
        "https://sepolia.infura.io/v3/1936342871af407688f7f4381bd50ceb"
      );

      if (userAddress == undefined) {
        return;
      }

      const wallets = await para.getWallets();
      console.log("User Wallets:", wallets);

      // Create the Para Ethers Signer
      const ethersSigner = new ParaEthersV5Signer(para, provider);

      // Basic operations
      const address = await ethersSigner.getAddress();
      const balance = await provider.getBalance(address);
      console.log("Balance:", ethers.utils.formatEther(balance));

      const bundlerUrl = process.env.NEXT_PUBLIC_REACT_APP_BUNDLE_URL;
      const paymasterUrl =
        process.env.NEXT_PUBLIC_REACT_APP_PAYMASTER_URL ||
        "https://paymaster.biconomy.io/api/v2/84532/F7wyL1clz.75a64804-3e97-41fa-ba1e-33e98c2cc703";

      const nexusClient = await createNexusClient({
        signer: address as `0x${string}`, // Pass signer directly
        chain: baseSepolia,
        transport: http(),
        bundlerTransport: http(bundlerUrl),
        paymaster: createBicoPaymasterClient({ paymasterUrl }),
      });

      const hash = await nexusClient.sendTransaction({
        calls: [
          {
            to: recipient as `0x${string}`,
            value: parseEther(amount),
          },
        ],
      });

      console.log("Transaction hash: ", hash);
      setTransactionHash(hash);

      const receipt = await nexusClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt: ", receipt);
      setTransactionReceipt(receipt);
    } catch (error) {
      console.error("Error during transaction: ", error);
      setTransactionHash(undefined);
      setTransactionReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-xl font-semibold mb-4">Send Gasless Transaction</h2>
      <input
        type="text"
        placeholder="Recipient Address (0x...)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="border p-2 mb-2 rounded w-80"
      />
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 mb-2 rounded w-80"
      />

      <button
        onClick={handleTransaction}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Send Gasless Transaction"}
      </button>

      {transactionHash && (
        <div className="mt-4 p-3 bg-gray-100 rounded w-80 text-center">
          <p className="text-sm font-medium">Transaction Hash:</p>
          <a
            href={`https://sepolia.basescan.org/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 break-all"
          >
            {transactionHash}
          </a>
        </div>
      )}
    </div>
  );
};

export default SignWithBiconomy;
