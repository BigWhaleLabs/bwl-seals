import { ethers, run } from 'hardhat'
import { utils } from 'ethers'
import prompt from 'prompt'

async function main() {
  const [deployer] = await ethers.getSigners()

  // Deploy the contract
  console.log('Deploying contracts with the account:', deployer.address)
  console.log(
    'Account balance:',
    utils.formatEther(await deployer.getBalance())
  )

  const provider = ethers.provider
  const { chainId } = await provider.getNetwork()
  const chains = {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
  } as { [chainId: number]: string }
  const chainName = chains[chainId]

  const { name, symbol, baseURI } = await prompt.get({
    properties: {
      name: {
        required: true,
        type: 'string',
        message: 'Contract name',
        default: 'BWLSeals',
      },
      symbol: {
        required: true,
        type: 'string',
        message: 'Contract symbol',
        default: 'BWLS',
      },
      baseURI: {
        required: true,
        type: 'string',
        message: 'Contract base URI',
      },
    },
  })

  const contractName = 'BWLSeals'
  console.log(`Deploying ${contractName}...`)
  const Contract = await ethers.getContractFactory('BWLSeals')
  const contract = await Contract.deploy(name, symbol, baseURI)

  console.log(
    'Deploy tx gas price:',
    utils.formatEther(contract.deployTransaction.gasPrice || 0)
  )
  console.log(
    'Deploy tx gas limit:',
    utils.formatEther(contract.deployTransaction.gasLimit)
  )
  await contract.deployed()
  const address = contract.address

  console.log('Contract deployed to:', address)
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))

  // Try to verify the contract on Etherscan
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address,
      constructorArguments: [name, symbol, baseURI],
    })
  } catch (err) {
    console.log(
      'Error verifiying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }

  // Print out the information
  console.log(`${contractName} deployed and verified on Etherscan!`)
  console.log('Contract address:', address)
  console.log(
    'Etherscan URL:',
    `https://${
      chainName !== 'mainnet' ? `${chainName}.` : ''
    }etherscan.io/address/${address}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
