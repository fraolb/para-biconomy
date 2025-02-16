"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";
import { ParaModal } from "@getpara/react-sdk";
import para from "../para";
import "@getpara/react-sdk/styles.css";
import {
  ParaEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  zerionWallet,
} from "@getpara/evm-wallet-connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { WalletType } from "@getpara/react-sdk";

const queryClient = new QueryClient();

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize router

  // Handle login event
  const handleLogin = async () => {
    try {
      const user = await para.getUserId();
      if (user) {
        console.log("User logged in:", user);

        // Fetch and log connected wallets
        const evmWallets = await para.getWalletsByType(WalletType.EVM);
        console.log("EVM Wallets after login:", evmWallets);

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleLogin();
    }, 15000);

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
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <div className="flex justify-center">
              <img
                src="https://mintlify.s3.us-west-1.amazonaws.com/getpara/logo/light.svg"
                width={300}
                height={300}
              />
            </div>
            <div className="flex justify-center w-full ">
              <button
                onClick={() => setIsOpen(true)}
                className="border border-black-500 p-2 px-4 rounded-md bg-orange-600 text-white"
              >
                Sign in with Para
              </button>

              <ParaModal
                para={para}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onLogin={handleLogin} // Trigger redirection after login
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
          </main>
        </div>
      </ParaEvmProvider>
    </QueryClientProvider>
  );
}
