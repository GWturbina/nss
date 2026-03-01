/**
 * Адреса контрактов NSS v2.4 на opBNB
 * ═══════════════════════════════════════
 * Обновлено: 16.02.2026
 */
const ADDRESSES = {
  // ═══ Внешние токены ═══
  USDT: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', // opBNB Mainnet USDT

  // ═══ NSS Core (13 контрактов) ═══
  CGTToken:          '0x56F5c29096BB7859e52086118aed31Fe08Fd6659',
  NSTToken:          '0xE9a2758F4BB29C4869d3Eee8fB9c9b176Fc4816A',
  NSSPlatform:       '0xFb1ddFa8A7EAB0081EAe24ec3d24B0ED4Dd84f2B',
  RealEstateMatrix:  '0x75B1FFD88E5935fae4b22105948818C913519AbA', // v2.4 + i18n
  MatrixPaymentsV2:  '0x959217Aab60f01cc582373E1a2bc36e7a076bc39',
  SwapHelper:        '0xFF0e9BFFf1cc5A6B65f689bF2442056627686Bf5',
  CharityFund:       '0x837389a13B300d37395343600507F34d03AC9abd',
  HousingFund:       '0x1d2aF2A868fCC547c3F9339AeC3e2DfaA533bE92',
  CardGiftMarketing: '0x67dD9ed3E63bA44047A70DA70AeC508101F048b7',
  GemVault:          '0x9b0fA988b0fb5Fe79332f66aB1F7a86584a1fd47',
  SafeVault:         '0x3263652D9D1f47F3bC211A7ecD1f5DEeE632Ce3f',
  AICredits:         '0xE208dc14A5033Bf30047edA0b7b54Cb87836318D',
  P2PEscrow:         '0xC0DA8bFEA02B034260939ccF5fe8cce55486e62c',

  // ═══ GlobalWay ═══
  GlobalWay:         '0xe8e2af46AEEec1B51B335f10C5912620B1a2707F',
  GlobalWayBridge:   '0x4489851e530924eB25e684E6b97c7C47364780F5',
  MatrixRegistry:    '0xD62945edFF7605dFc77A4bF607c96Da72E03cd0C',
  GWTToken:          '0x933B0Cb1f43170f3F0fcf082572CC931D6e93b5F',

  // ═══ Diamond Club v10.1 ═══
  GemVaultV2:        '0x_DEPLOY_GEMVAULT_V2',      // TODO: задеплоить
  MetalVault:        '0x_DEPLOY_METAL_VAULT',       // TODO: задеплоить
  InsuranceFund:     '0x_DEPLOY_INSURANCE_FUND',    // TODO: задеплоить
  TrustScore:        '0x_DEPLOY_TRUST_SCORE',       // TODO: задеплоить
  UserBoost:         '0x_DEPLOY_USER_BOOST',        // TODO: задеплоить
  ReferralPool:      '0x_DEPLOY_REFERRAL_POOL',     // TODO: задеплоить
  ShowcaseMarket:    '0x_DEPLOY_SHOWCASE_MARKET',   // TODO: задеплоить

  // ═══ PancakeSwap Router (opBNB) ═══
  PancakeRouter:     '0x10ED43C718714eb63d5aA57B78B54704E256024E',
}

export default ADDRESSES
