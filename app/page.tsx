"use client";

import Checkout from "./components/checkout";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  sepolia,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "Crossmint Headless UI Demo",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "",
  chains: [sepolia, baseSepolia, optimismSepolia, arbitrumSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

const Page = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <div className="container mx-auto max-w-3xl bg-white text-black rounded-lg my-5">
            <div className="grid grid-cols-1 sm:grid-cols-5 sm:gap-8 p-8">
              <Checkout />
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Page;
