'use client'
import { useEffect, useCallback, useRef } from 'react'
import useGameStore from './store'
import web3 from './web3'
import * as C from './contracts'

/**
 * useBlockchain() — подключение кошелька и синхронизация данных.
 * Вызывается один раз в корневом компоненте (page.js).
 */
export function useBlockchain() {
  const {
    wallet, setWallet, clearWallet, setConnecting,
    updateBalances, updateRegistration, updateTables,
    updatePending, updateCharity, updateHouse, setOwnerWallet,
    addNotification,
  } = useGameStore()

  const refreshRef = useRef(null)

  // Загрузить все данные пользователя
  const refreshData = useCallback(async (address) => {
    if (!address) return
    try {
      const [balances, regCheck, tables, pending, charity, house, userLevel] = await Promise.all([
        C.getBalances(address).catch(() => ({ bnb: '0', usdt: '0', cgt: '0', nst: '0' })),
        C.isRegistered(address).catch(() => false),
        C.getUserAllTables(address).catch(() => [null, null, null]),
        C.getMyPendingWithdrawal(address).catch(() => 0n),
        C.canGiveGift(address).catch(() => null),
        C.getHouseInfo(address).catch(() => null),
        C.getUserLevel(address).catch(() => 0),
      ])

      updateBalances(balances)
      updateRegistration(regCheck, null)
      updateTables(tables)
      if (userLevel > 0) useGameStore.getState().setLevel(userLevel)
      if (pending) updatePending((Number(pending) / 1e18).toFixed(2))
      if (charity) updateCharity((Number(charity[1]) / 1e18).toFixed(2), charity[0])
      if (house) updateHouse(house)

      // Загрузить owner контракта для admin-проверки
      const owner = await C.getOwner('RealEstateMatrix').catch(() => null)
      if (owner) setOwnerWallet(owner)
    } catch (err) {
      console.error('refreshData error:', err)
    }
  }, [updateBalances, updateRegistration, updateTables, updatePending, updateCharity, updateHouse, setOwnerWallet])

  // Авто-рефреш каждые 30 сек
  useEffect(() => {
    if (!wallet) return
    refreshData(wallet)
    refreshRef.current = setInterval(() => refreshData(wallet), 30000)
    return () => clearInterval(refreshRef.current)
  }, [wallet, refreshData])

  // Слушаем события кошелька
  useEffect(() => {
    const onDisconnected = () => {
      web3.disconnect()
      clearWallet()
    }
    const onAccountChanged = (e) => {
      const newAddr = e.detail?.address
      if (newAddr) {
        setWallet({ address: newAddr, chainId: web3.chainId, walletType: web3.walletType })
        refreshData(newAddr)
      }
    }
    const onChainChanged = (e) => {
      const chainId = e.detail?.chainId
      if (chainId !== 204 && chainId !== 5611) {
        addNotification('⚠️ Переключитесь на сеть opBNB!')
      }
    }

    window.addEventListener('wallet:disconnected', onDisconnected)
    window.addEventListener('wallet:accountChanged', onAccountChanged)
    window.addEventListener('wallet:chainChanged', onChainChanged)

    return () => {
      window.removeEventListener('wallet:disconnected', onDisconnected)
      window.removeEventListener('wallet:accountChanged', onAccountChanged)
      window.removeEventListener('wallet:chainChanged', onChainChanged)
    }
  }, [clearWallet, setWallet, refreshData, addNotification])

  // Подключение кошелька
  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const result = await web3.connect()
      setWallet(result)
      addNotification(`✅ Кошелёк подключён: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`)
      await refreshData(result.address)
      return true
    } catch (err) {
      addNotification(`❌ ${err.message}`)
      return false
    } finally {
      setConnecting(false)
    }
  }, [setConnecting, setWallet, refreshData, addNotification])

  // Отключение
  const disconnect = useCallback(() => {
    web3.disconnect()
    clearWallet()
  }, [clearWallet])

  return { connect, disconnect, refreshData: () => refreshData(wallet) }
}

/**
 * useTx() — обёртка для транзакций с loading state и уведомлениями
 */
export function useTx() {
  const { setTxPending, addNotification } = useGameStore()
  const { refreshData } = useBlockchain()

  const exec = useCallback(async (fn, successMsg, errorMsg) => {
    setTxPending(true)
    const result = await C.safeCall(fn)
    setTxPending(false)

    if (result.ok) {
      addNotification(successMsg || '✅ Транзакция выполнена!')
      // Рефреш данных через 2 сек (дождаться блок)
      setTimeout(() => refreshData(), 2000)
      return { ok: true, data: result.data }
    } else {
      addNotification(errorMsg || `❌ ${result.error}`)
      return { ok: false, error: result.error }
    }
  }, [setTxPending, addNotification, refreshData])

  return exec
}
