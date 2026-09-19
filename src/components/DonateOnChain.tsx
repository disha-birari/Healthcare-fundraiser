'use client';

import React, { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import MediTrustABI from '@/lib/abi/MediTrustABI.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Use Sepolia Deployed address placeholder
const CONTRACT_ADDRESS = "0xe644f6fA32252a17D87bC8b62A512f4581BE96bE"; 

interface DonateOnChainProps {
  campaignId: number;
  onSuccess: (txHash: string) => void;
  donationAmountInInr: number;
}

export default function DonateOnChain({ campaignId, onSuccess, donationAmountInInr }: DonateOnChainProps) {
  const { isConnected } = useAccount();
  
  // Convert INR to approximate ETH (e.g. 1 ETH = ~₹300,000) for simulation purposes
  const inrToEthRate = 300000;
  const initialEthAmount = (donationAmountInInr / inrToEthRate).toFixed(4);
  const [ethAmount, setEthAmount] = useState(initialEthAmount);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    // Keep eth amount updated with preset changes in the parent modal
    setEthAmount((donationAmountInInr / inrToEthRate).toFixed(4));
  }, [donationAmountInInr]);

  useEffect(() => {
    if (isSuccess && hash) {
      onSuccess(hash);
    }
  }, [isSuccess, hash, onSuccess]);

  const handleDonate = async () => {
    if (!isConnected) {
      alert("Please connect your MetaMask wallet first!");
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MediTrustABI.abi,
        functionName: 'donateToCampaign',
        args: [BigInt(campaignId)],
        value: parseEther(ethAmount),
      });
    } catch (err: any) {
      console.error("Failed to execute on-chain transaction:", err);
      alert(err.message || "Transaction execution failed.");
    }
  };

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
          <div className="text-xl">🔒</div>
          <div className="text-xs">
            <span className="font-extrabold text-slate-800 block">Web3 Wallet Connection Required</span>
            <span className="text-slate-500 block mt-0.5">Please connect your MetaMask or other Web3 wallet to authorize secure on-chain donations.</span>
          </div>
          <div className="pt-1">
            <ConnectButton label="Connect Wallet" />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Conversion estimate</span>
            <span className="font-bold text-slate-600">₹1 ETH ≈ ₹{inrToEthRate.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-1 uppercase tracking-wide">Donation (INR)</label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
                ₹{donationAmountInInr.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-1 uppercase tracking-wide">Estimated (ETH)</label>
              <input
                type="number"
                step="0.0001"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Transaction Status Indicator */}
          {hash && (
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[10px] font-mono leading-relaxed space-y-1">
              <div className="text-cyan-400 font-bold">Transaction Dispatched!</div>
              <div className="truncate">Hash: {hash}</div>
              <div className="text-slate-400">
                {isConfirming ? "⏳ Confirming block validation..." : "✅ Validated successfully!"}
              </div>
            </div>
          )}

          {error && (
            <div className="text-[10px] text-rose-500 leading-snug">
              <strong>Error:</strong> {error.message.includes("User rejected") ? "Transaction rejected by user in MetaMask." : (error as any).shortMessage || error.message}
            </div>
          )}

          <button
            onClick={handleDonate}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-xs font-black tracking-widest uppercase shadow-md shadow-teal-600/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Confirming on Blockchain...' : '🔐 Sign & Send On-Chain'}
          </button>
        </div>
      )}
    </div>
  );
}
