'use client'
import { useEffect, useCallback } from 'react'
import useGameStore from './store'
import web3 from './web3'
import * as C from './contracts'

// ═══════════════════════════════════════════════════
// СИНГЛТОН: только один рефреш-цикл на всё приложение
// ═══════════════════════════════════════════════════
let _refreshInterval = null
let _listenersAttached = false

/** Загрузить все данные пользователя (модульная функция) */
async function refreshDataForAddress(address) {
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

    const store = useGameStore.getState()
    store.updateBalances(balances)
    store.updateRegistration(regCheck, null)
    store.updateTables(tables)
    if (userLevel > 0) store.setLevel(userLevel)
    if (pending) store.updatePending((Number(pending) / 1e18).toFixed(2))
    if (charity) store.updateCharity((Number(charity[1]) / 1e18).toFixed(2), charity[0])
    if (house) store.updateHouse(house)

    // owner для admin-проверки
    const owner = await C.getOwner('RealEstateMatrix').catch(() => null)
    if (owner) store.setOwnerWallet(owner)
  } catch (err) {
    console.error('refreshData error:', err)
  }
}

/** Подключить кошелёк */
async function doConnect() {
  const store = useGameStore.getState()
  store.setConnecting(true)
  try {
    const result = await web3.connect()
    store.setWallet(result)
    store.addNotification(`✅ Кошелёк: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`)

    // Загрузить данные один раз
    await refreshDataForAddress(result.address)

    // Запустить авторефреш (если ещё нет)
    startRefreshCycle(result.address)

    return true
  } catch (err) {
    store.addNotification(`❌ ${err.message}`)
    return false
  } finally {
    store.setConnecting(false)
  }
}

/** Отключить кошелёк */
function doDisconnect() {
  web3.disconnect()
  stopRefreshCycle()
  useGameStore.getState().clearWallet()
}

/** Запуск авторефреша (30 сек) — ОДИН на всё приложение */
function startRefreshCycle(address) {
  stopRefreshCycle()
  _refreshInterval = setInterval(() => refreshDataForAddress(address), 30000)
}

/** Остановка авторефреша */
function stopRefreshCycle() {
  if (_refreshInterval) {
    clearInterval(_refreshInterval)
    _refreshInterval = null
  }
}

// ═══════════════════════════════════════════════════
// ХУКИ
// ═══════════════════════════════════════════════════

/**
 * useBlockchainInit() — вызывается ОДИН РАЗ в корневом page.js
 * Подписывается на события кошелька и запускает рефреш при наличии wallet.
 */
export function useBlockchainInit() {
  const wallet = useGameStore(s => s.wallet)

  // Слушаем события кошелька — один раз
  useEffect(() => {
    if (_listenersAttached) return
    _listenersAttached = true

    const onDisconnected = () => {
      doDisconnect()
    }
    const onAccountChanged = (e) => {
      const newAddr = e.detail?.address
      if (newAddr) {
        const store = useGameStore.getState()
        store.setWallet({ address: newAddr, chainId: web3.chainId, walletType: web3.walletType })
        refreshDataForAddress(newAddr)
        startRefreshCycle(newAddr)
      }
    }
    const onChainChanged = (e) => {
      const chainId = e.detail?.chainId
      if (chainId !== 204 && chainId !== 5611) {
        useGameStore.getState().addNotification('⚠️ Переключитесь на сеть opBNB!')
      }
    }

    window.addEventListener('wallet:disconnected', onDisconnected)
    window.addEventListener('wallet:accountChanged', onAccountChanged)
    window.addEventListener('wallet:chainChanged', onChainChanged)

    return () => {
      window.removeEventListener('wallet:disconnected', onDisconnected)
      window.removeEventListener('wallet:accountChanged', onAccountChanged)
      window.removeEventListener('wallet:chainChanged', onChainChanged)
      _listenersAttached = false
    }
  }, [])

  // Если wallet уже есть (reload) — запустить рефреш
  useEffect(() => {
    if (wallet && !_refreshInterval) {
      refreshDataForAddress(wallet)
      startRefreshCycle(wallet)
    }
    if (!wallet) {
      stopRefreshCycle()
    }
  }, [wallet])
}

/**
 * useBlockchain() — безопасно вызывать из ЛЮБОГО компонента.
 * НЕ создаёт интервалы, НЕ подписывается на события.
 * Просто возвращает connect / disconnect / refreshData.
 */
export function useBlockchain() {
  const wallet = useGameStore(s => s.wallet)

  return {
    connect: doConnect,
    disconnect: doDisconnect,
    refreshData: () => refreshDataForAddress(wallet),
  }
}

/**
 * useTx() — обёртка для транзакций с loading state и уведомлениями
 */
export function useTx() {
  const { setTxPending, addNotification } = useGameStore()
  const wallet = useGameStore(s => s.wallet)

  const exec = useCallback(async (fn, successMsg, errorMsg) => {
    setTxPending(true)
    const result = await C.safeCall(fn)
    setTxPending(false)

    if (result.ok) {
      addNotification(successMsg || '✅ Транзакция выполнена!')
      // Рефреш данных через 2 сек (дождаться блок)
      setTimeout(() => refreshDataForAddress(wallet), 2000)
      return { ok: true, data: result.data }
    } else {
      addNotification(errorMsg || `❌ ${result.error}`)
      return { ok: false, error: result.error }
    }
  }, [setTxPending, addNotification, wallet])

  return exec
}
