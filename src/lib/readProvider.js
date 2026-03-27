'use client'
/**
 * Общий read-only провайдер для opBNB
 * Один экземпляр вместо трёх дублей в contracts.js / exchangeContracts.js / loanContracts.js
 */
import { ethers } from 'ethers'

const READ_RPC = 'https://opbnb-mainnet-rpc.bnbchain.org'
export const readProvider = new ethers.JsonRpcProvider(READ_RPC)
export default readProvider
