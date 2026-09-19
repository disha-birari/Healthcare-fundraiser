import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MediTrust AI',
  projectId: 'a5cf6e838634cf4cfbdc7eeeb1ef748b', // Standard public projectId placeholder for RainbowKit setup
  chains: [sepolia],
  ssr: true,
});
