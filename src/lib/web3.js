/**
 * Web3 Module — SafePal + opBNB
 * 
 * SafePal поддерживает WalletConnect и injected provider (window.ethereum)
 * При открытии DApp в SafePal Browser — доступен window.ethereum
 * 
 * Приоритет:
 * 1. SafePal injected (DApp Browser)
 * 2. MetaMask / другой injected
 * 3. WalletConnect (QR)
 */
import { ethers } from 'ethers';

// opBNB Mainnet
const OPBNB_CHAIN = {
  chainId: '0xCC',  // 204
  chainName: 'opBNB Mainnet',
  rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  blockExplorerUrls: ['https://opbnb.bscscan.com'],
};

// opBNB Testnet (для тестирования)
const OPBNB_TESTNET = {
  chainId: '0x15EB',  // 5611
  chainName: 'opBNB Testnet',
  rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org'],
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  blockExplorerUrls: ['https://opbnb-testnet.bscscan.com'],
};

// Используем mainnet по умолчанию, переключи на OPBNB_TESTNET для тестов
const TARGET_CHAIN = OPBNB_CHAIN;
const TARGET_CHAIN_ID = 204; // Переключи на 5611 для testnet

class Web3Module {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.contracts = {};
    this.addresses = null; // Загружается из addresses.json
    this.isConnected = false;
    this.walletType = null; // 'safepal', 'metamask', 'walletconnect'
  }

  /**
   * Определяем тип кошелька
   */
  detectWallet() {
    if (typeof window === 'undefined') return null;
    
    // SafePal injected — есть window.ethereum.isSafePal
    if (window.ethereum?.isSafePal) return 'safepal';
    
    // MetaMask
    if (window.ethereum?.isMetaMask) return 'metamask';
    
    // Любой другой injected provider
    if (window.ethereum) return 'injected';
    
    return null;
  }

  /**
   * Подключение кошелька
   */
  async connect() {
    const walletType = this.detectWallet();
    
    if (!walletType) {
      // Нет injected → предлагаем SafePal
      throw new Error('Кошелёк не найден. Откройте в SafePal Browser или установите SafePal.');
    }

    try {
      this.walletType = walletType;
      
      // Запрашиваем доступ к аккаунтам
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('Нет доступных аккаунтов');
      }

      // Создаём провайдер
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      
      // Проверяем сеть
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      if (this.chainId !== TARGET_CHAIN_ID) {
        await this.switchNetwork();
      }

      // Слушаем события
      window.ethereum.on('accountsChanged', this._handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this._handleChainChanged.bind(this));

      this.isConnected = true;
      
      return {
        address: this.address,
        chainId: this.chainId,
        walletType: this.walletType,
      };
    } catch (error) {
      console.error('Ошибка подключения:', error);
      throw error;
    }
  }

  /**
   * Переключить сеть на opBNB
   */
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN.chainId }],
      });
    } catch (switchError) {
      // Сеть не добавлена — добавляем
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_CHAIN],
        });
      } else {
        throw switchError;
      }
    }

    // Обновляем провайдер
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.chainId = TARGET_CHAIN_ID;
  }

  /**
   * Отключение
   */
  disconnect() {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this._handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', this._handleChainChanged);
    }
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.isConnected = false;
    this.contracts = {};
  }

  /**
   * Получить баланс BNB
   */
  async getBalance() {
    if (!this.provider || !this.address) return '0';
    const balance = await this.provider.getBalance(this.address);
    return ethers.formatEther(balance);
  }

  // ═══════════════════════════════════════════════════
  // КОНТРАКТЫ
  // ═══════════════════════════════════════════════════

  /**
   * Загрузить адреса контрактов
   */
  setAddresses(addresses) {
    this.addresses = addresses;
  }

  /**
   * Получить экземпляр контракта
   */
  getContract(name, abi) {
    if (!this.signer || !this.addresses?.[name]) {
      throw new Error(`Контракт ${name} не инициализирован`);
    }
    if (!this.contracts[name]) {
      this.contracts[name] = new ethers.Contract(
        this.addresses[name],
        abi,
        this.signer
      );
    }
    return this.contracts[name];
  }

  /**
   * Получить read-only контракт (без подписи)
   */
  getReadContract(name, abi) {
    if (!this.provider || !this.addresses?.[name]) return null;
    return new ethers.Contract(this.addresses[name], abi, this.provider);
  }

  // ═══════════════════════════════════════════════════
  // USDT APPROVE (PATCH FRONT-05)
  // ═══════════════════════════════════════════════════

  /**
   * Стандартный ERC20 ABI для approve/allowance
   */
  get usdtAbi() {
    return [
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function balanceOf(address account) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];
  }

  /**
   * Проверить и сделать approve USDT для контракта
   * @param {string} spenderName - Имя контракта из addresses (напр. 'RealEstateMatrix')
   * @param {BigInt} amount - Сумма для approve
   */
  async approveUSDT(spenderName, amount) {
    if (!this.signer || !this.addresses?.USDT || !this.addresses?.[spenderName]) {
      throw new Error('USDT или контракт не настроен');
    }
    const usdt = new ethers.Contract(this.addresses.USDT, this.usdtAbi, this.signer);
    const spenderAddr = this.addresses[spenderName];
    const allowance = await usdt.allowance(this.address, spenderAddr);
    if (allowance < amount) {
      const tx = await usdt.approve(spenderAddr, amount);
      await tx.wait();
    }
  }

  /**
   * Получить баланс USDT пользователя
   */
  async getUSDTBalance() {
    if (!this.provider || !this.address || !this.addresses?.USDT) return '0';
    const usdt = new ethers.Contract(this.addresses.USDT, this.usdtAbi, this.provider);
    const balance = await usdt.balanceOf(this.address);
    return ethers.formatEther(balance);
  }

  // ═══════════════════════════════════════════════════
  // ВЫЗОВЫ КОНТРАКТОВ
  // ═══════════════════════════════════════════════════

  /**
   * Регистрация в NSS → GlobalWay
   */
  async register(sponsorId, nssAbi) {
    const nss = this.getContract('NSSPlatform', nssAbi);
    const tx = await nss.register(sponsorId);
    return await tx.wait();
  }

  /**
   * Покупка уровня
   */
  async buyLevel(level, nssAbi) {
    const nss = this.getContract('NSSPlatform', nssAbi);
    const price = await nss.bridge().then(b => {
      const bridge = new ethers.Contract(b, ['function getLevelPrice(uint8) view returns (uint256)'], this.provider);
      return bridge.getLevelPrice(level);
    });
    const tx = await nss.buyLevel(level, { value: price });
    return await tx.wait();
  }

  /**
   * Покупка м² (вход в проект) — USDT!
   * PATCH FRONT-02: Контракт использует USDT, не BNB
   */
  async buySlot(tableId, realEstateAbi) {
    const re = this.getContract('RealEstateMatrix', realEstateAbi);
    const config = await re.tables(tableId);
    const price = config.entryPrice;

    // Шаг 1: Approve USDT для RealEstateMatrix
    await this.approveUSDT('RealEstateMatrix', price);

    // Шаг 2: Покупка (без {value:} — это USDT, не BNB!)
    const tx = await re.buySlot(tableId);
    return await tx.wait();
  }

  /**
   * Выбор: продолжить цикл в Большом Бизнесе
   */
  async chooseContinue(continueChoice, realEstateAbi) {
    const re = this.getContract('RealEstateMatrix', realEstateAbi);
    const tx = await re.chooseContinueReinvest(continueChoice);
    return await tx.wait();
  }

  /**
   * Покупка камня
   */
  async buyGem(gemId, gemVaultAbi) {
    const gv = this.getContract('GemVault', gemVaultAbi);
    const price = await gv.getClubPrice(gemId);
    const tx = await gv.buyGem(gemId, { value: price });
    return await tx.wait();
  }

  /**
   * Покупка AI кредитов
   */
  async buyAICredits(packageId, aiCreditsAbi) {
    const ai = this.getContract('AICredits', aiCreditsAbi);
    const pkg = await ai.packages(packageId);
    const tx = await ai.buyCredits(packageId, { value: pkg.priceBNB });
    return await tx.wait();
  }

  /**
   * Подать заявку на дом — USDT!
   * PATCH FRONT-03: Контракт использует USDT, не BNB
   */
  async applyForHouse(housePrice, location, country, housingAbi) {
    const hf = this.getContract('HousingFund', housingAbi);
    const deposit = (housePrice * 35n) / 100n;

    // Шаг 1: Approve USDT для HousingFund
    await this.approveUSDT('HousingFund', deposit);

    // Шаг 2: Подача заявки (без {value:} — это USDT!)
    const tx = await hf.applyForHouse(housePrice, location, country);
    return await tx.wait();
  }

  /**
   * БлагоДАРЮ — подарить место
   */
  async giveGift(recipientAddress, charityAbi) {
    const cf = this.getContract('CharityFund', charityAbi);
    const donorId = await this.addresses.getBridgeOdixId?.(this.address) || 0;
    const tx = await cf.giveGift(recipientAddress, donorId);
    return await tx.wait();
  }

  // ═══════════════════════════════════════════════════
  // READ ФУНКЦИИ
  // ═══════════════════════════════════════════════════

  async getUserNSSInfo(nssAbi) {
    const nss = this.getReadContract('NSSPlatform', nssAbi);
    if (!nss) return null;
    return await nss.getUserNSSInfo(this.address);
  }

  async getUserTableInfo(tableId, realEstateAbi) {
    const re = this.getReadContract('RealEstateMatrix', realEstateAbi);
    if (!re) return null;
    return await re.getUserTableInfo(this.address, tableId);
  }

  async getHouseInfo(housingAbi) {
    const hf = this.getReadContract('HousingFund', housingAbi);
    if (!hf) return null;
    return await hf.getHouseInfo(this.address);
  }

  async getTokenBalances(cgtAbi, nstAbi) {
    const cgt = this.getReadContract('CGTToken', cgtAbi);
    const nst = this.getReadContract('NSTToken', nstAbi);
    const [cgtBal, nstBal] = await Promise.all([
      cgt ? cgt.balanceOf(this.address) : 0n,
      nst ? nst.balanceOf(this.address) : 0n,
    ]);
    return {
      cgt: ethers.formatEther(cgtBal),
      nst: ethers.formatEther(nstBal),
    };
  }

  // ═══════════════════════════════════════════════════
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ═══════════════════════════════════════════════════

  _handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.disconnect();
      window.dispatchEvent(new CustomEvent('wallet:disconnected'));
    } else {
      this.address = accounts[0];
      this.contracts = {}; // Сброс кеша контрактов
      window.dispatchEvent(new CustomEvent('wallet:accountChanged', { detail: { address: accounts[0] } }));
    }
  }

  _handleChainChanged(chainId) {
    const numericChainId = parseInt(chainId, 16);
    this.chainId = numericChainId;
    window.dispatchEvent(new CustomEvent('wallet:chainChanged', { detail: { chainId: numericChainId } }));
    // Перезагрузка рекомендуется MetaMask
    if (numericChainId !== TARGET_CHAIN_ID) {
      console.warn('Неправильная сеть! Нужен opBNB (chainId 204)');
    }
  }
}

// Синглтон
const web3 = new Web3Module();
export default web3;

// Хелпер для форматирования адреса
export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Хелпер для BNB → USD (примерный)
export function bnbToUsd(bnb, bnbPrice = 666) {
  return (parseFloat(bnb) * bnbPrice).toFixed(2);
}

// PATCH INFO-03: Безопасная обёртка для контрактных вызовов
export async function safeContractCall(fn, fallback = null) {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    const msg = error?.reason || error?.message || 'Неизвестная ошибка';
    console.error('Contract call failed:', msg);

    // Понятные ошибки для пользователя
    if (msg.includes('user rejected')) return { error: 'Транзакция отклонена' };
    if (msg.includes('insufficient funds')) return { error: 'Недостаточно средств' };
    if (msg.includes('UNPREDICTABLE_GAS')) return { error: 'Ошибка газа — проверьте баланс BNB' };
    if (msg.includes('execution reverted')) {
      const reason = msg.match(/reason="([^"]+)"/)?.[1] || msg.match(/reverted: (.+)/)?.[1] || '';
      return { error: `Контракт отклонил: ${reason || 'неизвестная причина'}` };
    }
    return fallback !== null ? fallback : { error: msg };
  }
}

// PATCH INFO-03: Валидация ответов от контракта
export function validateAddress(addr) {
  return addr && addr !== '0x0000000000000000000000000000000000000000' && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export function validateAmount(amount) {
  return amount !== undefined && amount !== null && BigInt(amount) >= 0n;
}
