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

const queryClient = new QueryClient();

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize router

  // Handle login event
  const handleLogin = async () => {
    try {
      const user = await para.getUserId(); // Fetch user data
      if (user) {
        router.push("/dashboard"); // Redirect user after login
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    handleLogin();
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
            <div>
              <button onClick={() => setIsOpen(true)}>Sign in with Para</button>

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
            <button
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              {" "}
              route
            </button>
          </main>
        </div>
      </ParaEvmProvider>
    </QueryClientProvider>
  );
}
