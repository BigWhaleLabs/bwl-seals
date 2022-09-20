import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import type { BWLSeals, BWLSeals__factory } from '../typechain-types'

declare module 'mocha' {
  export interface Context {
    // Facoriries for contracts
    contract: BWLSeals
    contractWithIncorrectOwner: BWLSeals
    factory: BWLSeals__factory
    // Contract meta data
    name: string
    symbol: string
    baseURI: string
    // Signers
    accounts: SignerWithAddress[]
    owner: SignerWithAddress
    user: SignerWithAddress
  }
}
