import { ethers } from 'hardhat'
import { expect } from 'chai'

const ADDRESS = '0x0000000000000000000000000000000000000001'
const BATCH_OF_ADDRESSES = [
  '0x0000000000000000000000000000000000000002',
  '0x0000000000000000000000000000000000000003',
  '0x0000000000000000000000000000000000000004',
  '0x0000000000000000000000000000000000000005',
]

describe('BWLSeals contract tests', () => {
  before(async function () {
    this.accounts = await ethers.getSigners()
    this.owner = this.accounts[0]
    this.user = this.accounts[1]
    this.name = 'BWLSeals'
    this.symbol = 'BWLS'
    this.baseURI = 'https://example.com'
    this.factory = await ethers.getContractFactory('BWLSeals')
  })

  describe('Constructor', function () {
    before(async function () {
      this.contract = await this.factory.deploy(
        this.name,
        this.symbol,
        this.baseURI
      )
    })
    it('should deploy the contract with the correct fields', async function () {
      expect(await this.contract.name()).to.equal(this.name)
      expect(await this.contract.symbol()).to.equal(this.symbol)
    })
  })
  describe('Owner-only calls from non-owner', function () {
    before(async function () {
      this.contract = await this.factory.deploy(
        this.name,
        this.symbol,
        this.baseURI
      )
      this.contractWithIncorrectOwner = this.contract.connect(this.user)
    })
    it('should not be able to call mint', async function () {
      await expect(
        this.contractWithIncorrectOwner.mint([ADDRESS])
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('should not be able to call setBaseURI', async function () {
      await expect(
        this.contractWithIncorrectOwner.setBaseURI(this.baseURI)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
  describe('Contract', function () {
    before(async function () {
      this.contract = await this.factory.deploy(
        this.name,
        this.symbol,
        this.baseURI
      )
      await this.contract.setBaseURI(this.baseURI)
    })
    it('should setBaseURI', async function () {
      expect(await this.contract.setBaseURI(this.baseURI))
    })
    it('should mint for single address', async function () {
      const tx = await this.contract.mint([ADDRESS])
      expect(await tx.wait())
      expect(await this.contract.balanceOf(ADDRESS)).to.be.equal(1)
    })
    it('should mint', async function () {
      const tx = await this.contract.mint(BATCH_OF_ADDRESSES)
      expect(await tx.wait())

      for (let i = 0; i < BATCH_OF_ADDRESSES.length; i++) {
        expect(
          await this.contract.balanceOf(BATCH_OF_ADDRESSES[i])
        ).to.be.equal(1)
      }
    })
    it('should return correct tokenURI', async function () {
      const tx = await this.contract.mint(BATCH_OF_ADDRESSES)
      expect(await tx.wait())

      expect(await this.contract.tokenURI(0)).to.be.equal(this.baseURI + '/0')
    })
  })
})
