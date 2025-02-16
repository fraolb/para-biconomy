"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParaModal, OAuthMethod, WalletType } from "@getpara/react-sdk";
import { createNexusClient } from "@biconomy/sdk";
import {
  createSmartAccountClient,
  createBicoPaymasterClient,
  toNexusAccount,
} from "@biconomy/abstractjs";
import { http, parseEther } from "viem";
import para from "../../para";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

import { ParaEthersV5Signer } from "@getpara/ethers-v5-integration";
import { ethers } from "ethers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, celo, mainnet, polygon, baseSepolia } from "wagmi/chains";
import {
  ParaEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  zerionWallet,
} from "@getpara/evm-wallet-connectors";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";

const queryClient = new QueryClient();

const SignWithBiconomy: React.FC = () => {
  const router = useRouter();

  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [amount, setAmount] = useState<string>("0");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [smartAccount, setSmartAccount] = useState<
    BiconomySmartAccountV2 | undefined
  >();
  const [smartAddress, setSmartAddress] = useState<`0x${string}` | null>();

  const provider = new ethers.JsonRpcProvider(
    "https://base-sepolia.infura.io/v3/1936342871af407688f7f4381bd50ceb"
  );

  const bundlerUrl =
    "https://bundler.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44";
  const paymasterUrl =
    "https://paymaster.biconomy.io/api/v2/84532/F7wyL1clz.75a64804-3e97-41fa-ba1e-33e98c2cc703";

  const createSmartAccount = async () => {
    if (!para.getUserId()) {
      alert("Please connect your Para account.");
      return;
    }

    setLoading(true);
    try {
      const ethersSigner = new ParaEthersSigner(para, provider);

      if (!ethersSigner) {
        throw new Error("Failed to retrieve signer for wallet.");
      }

      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        signer: ethersSigner,
        chainId: baseSepolia.id,
        bundlerUrl: bundlerUrl,
        biconomyPaymasterApiKey: paymasterUrl,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });

      setSmartAccount(biconomySmartAccount);
      const address = await biconomySmartAccount.getAddress();
      setSmartAddress(address);
    } catch (error) {
      console.error("Error during transaction: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!recipient) {
      alert("Please add recipient address");
      return;
    }
    if (!para.getUserId()) {
      alert("Please connect your Para account.");
      return;
    }

    console.log("The para user ID is ", para.getUserId());

    setLoading(true);
    try {
      const userId = await para.getUserId();
      if (!userId) {
        alert("User is not logged in. Please log in first.");
        return;
      }

      console.log("User ID:", userId);

      let evmWallets = await para.getWalletsByType(WalletType.EVM);
      console.log("EVM Wallets:", evmWallets);

      let walletId;

      if (!evmWallets || evmWallets.length === 0) {
        console.log("No EVM wallet found. Creating a pregenerated wallet...");

        const pregenWallet = await para.createPregenWallet({
          type: WalletType.EVM,
          pregenIdentifier: userId,
          pregenIdentifierType: "CUSTOM_ID",
        });

        console.log("New pregenerated wallet created:", pregenWallet.id);
        evmWallets = await para.getWalletsByType(WalletType.EVM);
      }

      if (!evmWallets || evmWallets.length === 0) {
        alert("Failed to create or retrieve a wallet. Please try again.");
        return;
      }

      walletId = evmWallets[0].id;
      console.log("Using Wallet ID:", walletId);

      // Get the signer for this wallet

      const ethersSigner = new ParaEthersSigner(para, provider);
      const address = await ethersSigner.getAddress();
      console.log(
        "Signer Address:",
        ethersSigner,
        ethersSigner.getAddress(),
        ethersSigner.getNonce(),
        "wallet ",
        para.getWallets()[0],

        address
      );
      const wallets = para.getWallets();
      const firstWallet = Object.values(wallets)[0];

      const signer = {
        ...ethersSigner,
        address: (await ethersSigner.getAddress()) as `0x${string}`, // ✅ Add explicit address property
        getAddress: async () => ethersSigner.getAddress(),
        signTransaction: async (tx: ethers.TransactionRequest) =>
          ethersSigner.signTransaction(tx),
        signMessage: async (message: string | Uint8Array) =>
          ethersSigner.signMessage(message),
        signTypedData: async (
          domain: ethers.TypedDataDomain,
          types: Record<string, Array<ethers.TypedDataField>>,
          value: Record<string, any>
        ) => ethersSigner.signTypedData(domain, types, value),
      };

      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(`${privateKey}`);

      // Ensure the signer is valid
      if (!ethersSigner) {
        throw new Error("Failed to retrieve signer for wallet.");
      }

      // Use the recovered signer from Para, instead of generating a new one
      const nexusClient = createSmartAccountClient({
        account: await toNexusAccount({
          signer: account,
          chain: baseSepolia,
          transport: http(),
        }),
        transport: http(bundlerUrl),
        paymaster: createBicoPaymasterClient({ paymasterUrl }),
      });

      const hash = await nexusClient.sendUserOperation({
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
      setLoading(false);
    } catch (error) {
      console.error("Error during transaction: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const checkLogin = async () => {
        try {
          const user = await para.getUserId();
          if (!user) {
            router.push("/");
          }
        } catch (error) {
          console.error("Login check error:", error);
          router.push("/");
        }
      };
      checkLogin();
    }, 55000);

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ParaEvmProvider
        config={{
          projectId: "your_wallet_connect_project_id",
          appName: "your_app_name",
          chains: [mainnet, polygon, sepolia, celo],
          wallets: [
            metaMaskWallet,
            rainbowWallet,
            zerionWallet,
            coinbaseWallet,
          ],
          para: para, // Your para client instance
        }}
      >
        <div className="min-h-screen p-8">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
            <ParaModal
              para={para}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              theme={{
                backgroundColor: "#ffffff",
                foregroundColor: "#000000",
              }}
              oAuthMethods={["GOOGLE", "FARCASTER"]}
              authLayout={["AUTH:FULL", "EXTERNAL:FULL"]}
              externalWallets={[
                "METAMASK",
                "COINBASE",
                "RABBY",
                "RAINBOW",
                "ZERION",
              ]}
              recoverySecretStepEnabled
              onRampTestMode={true}
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Create a Biconomy Smart Account
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={createSmartAccount}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "Create Smart Account"}
                </button>
              </div>
              {smartAccount && (
                <div className="flex justify-center mt-4">
                  <div className="mt-4 p-3 bg-gray-100 rounded w-1/2 text-center">
                    <p className="text-sm font-medium">{smartAddress}</p>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center mt-8">
              Send Gasless Transaction
            </h2>
            <div className="block justify-center">
              <div className="flex justify-center">
                <input
                  type="text"
                  placeholder="Recipient Address (0x...)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="border p-2 mb-2 rounded w-80"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="text"
                  placeholder="Amount (ETH)"
                  disabled
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border p-2 mb-2 rounded w-80"
                />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleTransaction}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {loading ? "Processing..." : "Send Gasless Transaction"}
              </button>
            </div>

            {transactionHash && (
              <div className="flex justify-center mt-4">
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
              </div>
            )}
          </div>{" "}
        </div>
      </ParaEvmProvider>
    </QueryClientProvider>
  );
};

export default SignWithBiconomy;
