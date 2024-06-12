"use client";

import { useState, useEffect, useRef } from "react";
import { parseTransaction } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useSendTransaction,
} from "wagmi";

const Checkout = () => {
  const [order, setOrder] = useState<any>();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("degen");
  const hasCreatedOrder = useRef(false);

  const account = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: hash, isPending, sendTransactionAsync } = useSendTransaction();

  // upon initial render create a new order and save it to state
  useEffect(() => {
    if (hasCreatedOrder.current) {
      return;
    }

    createOrder({
      payment: {
        method: "base",
        currency: selectedCurrency,
      },
      locale: "en-US",
      lineItems: {
        collectionLocator: `crossmint:${process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID}`,
        callData: {
          totalPrice: "1",
        },
      },
    });

    hasCreatedOrder.current = true;
  }, [selectedCurrency]);

  // update the existing order whenever chainId or connected wallet changes
  useEffect(() => {
    const updateExistingOrder = async () => {
      try {
        if (!order) {
          return;
        }

        const chain = chainIdMap[chainId.toString()];
        const currency = chain === "base" ? selectedCurrency : "eth";

        await updateOrder({
          payment: {
            method: chain,
            currency: currency,
            payerAddress: account.address,
          },
          recipient: {
            walletAddress: account.address,
          },
        });
      } catch (error) {
        throw new Error("Failed to update order");
      }
    };

    updateExistingOrder();
  }, [chainId, account.address, selectedCurrency]);

  const createOrder = async (orderInput: any) => {
    try {
      const res = await fetch(`/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderInput),
      });

      const order = await res.json();

      console.log("order", order);
      setOrder(order.order);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create order");
    }
  };

  const updateOrder = async (orderInput: any) => {
    console.log("update order with: ", orderInput);
    try {
      const res = await fetch(`/orders/${order.orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderInput),
      });

      const updatedOrder = await res.json();

      console.log("order", updatedOrder);
      setOrder(updatedOrder);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to update order");
    }
  };

  const getOrder = async () => {
    console.log("refresh order");
    try {
      const res = await fetch(`/orders/${order.orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const refreshedOrder = await res.json();

      console.log("fetched order", refreshedOrder);
      setOrder(refreshedOrder);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to fetch order");
    }
  };

  // send the ETH payment for the purchase
  const signAndSendTransaction = async () => {
    const txn = parseTransaction(
      order.payment.preparation.serializedTransaction || "0x"
    );

    if (txn.chainId !== chainId) {
      switchChain({ chainId: Number(txn.chainId) });
      return;
    }

    await sendTransactionAsync({
      to: txn.to as `0x${string}`,
      value: BigInt(txn.value ? txn.value.toString() : "0"),
      data: txn.data as `0x${string}`,
      chainId: txn.chainId,
    });
  };

  const handleNetworkChange = async (event: any) => {
    const chainId = event.target.value;
    switchChain({ chainId: Number(chainId) });
  };

  const handleCurrencyChange = (event: any) => {
    setSelectedCurrency(event.target.value);
  };

  const metadata = order ? order.lineItems[0].metadata : null;
  const price = order ? order.lineItems[0].quote.totalPrice : null;

  const chainIdMap: { [key: string]: string } = {
    "42161": "arbitrum",
    "8453": "base",
    "1": "ethereum",
    "10": "optimism",
  };

  return (
    <>
      <div className="flex justify-between items-center sm:col-span-5">
        <h1 className="text-xl font-bold my-4">Headless Checkout UI Demo</h1>
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="full"
        />
      </div>

      <div className="col-span-2">
        {metadata && (
          <div className="">
            <img
              src={metadata.imageUrl}
              alt="Collection Image"
              className="border rounded"
            />
            <h3 className="text-lg font-bold py-3">{metadata.name}</h3>
            <p>{metadata.description}</p>
          </div>
        )}
      </div>

      <div className="col-span-3">
        <div className="py-2 px-5 my-2 w-full bg-blue-100 text-blue-700 border border-blue-400 rounded">
          <strong>Current Status: </strong>
          <code>{order?.payment.status}</code>
        </div>

        {price && (
          <>
            {parseFloat(price.amount).toFixed(6)} {price.currency.toUpperCase()}
          </>
        )}

        <div className="flex justify-between items-center">
          <select
            value={chainId}
            onChange={handleNetworkChange}
            className="block w-full p-2 mr-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select network</option>
            <option value="1">Ethereum</option>
            <option value="42161">Arbitrum</option>
            <option value="8453">Base Mainnet</option>
            <option value="10">Optimism</option>
          </select>

          {chainId === 8453 && (
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="block w-full p-2 ml-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="degen">Degen</option>
              <option value="toshi">Toshi</option>
              <option value="brett">Brett</option>
              <option value="eth">ETH</option>
            </select>
          )}

          <button
            onClick={() => signAndSendTransaction()}
            disabled={isPending}
            className="bg-gradient-to-br from-[#01b15d] to-[#0296a8] hover:bg-gradient-to-br hover:from-[#00ff85] hover:to-[#00e1fc] text-white font-bold py-2 px-4 my-2 rounded"
          >
            Pay
          </button>
        </div>

        {isPending && (
          <div className="pt-5">
            Awaiting confirmation...<div className="ml-3 spinner"></div>
          </div>
        )}

        {hash && (
          <>
            <div className="p-2 my-3 bg-gray-100 overflow-auto rounded">
              transaction hash:{" "}
              <pre>
                <code>{hash}</code>
              </pre>
            </div>

            <button
              onClick={() => getOrder()}
              className="bg-gradient-to-br from-[#01b15d] to-[#0296a8] hover:bg-gradient-to-br hover:from-[#00ff85] hover:to-[#00e1fc] text-white font-bold py-2 px-4 rounded"
            >
              Check Delivery Status
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Checkout;
