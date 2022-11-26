import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { contractAddress } from './constants'
import HelloWorld from './contracts/HelloWorld.json'

import './App.css'

function App() {
  const [account, setAccount] = useState('')
  const [message, setMessage] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAccount(accounts[0])
      } catch (error) {
        console.log(error)
      }
    }
  }

  const getMessage = async () => {
    if (window.ethereum && account) {
      console.log('Getting message...')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        contractAddress,
        HelloWorld.abi,
        signer
      )

      try {
        const transactionResponse = await contract.message()
        setMessage(transactionResponse)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const updateMessage = async (_message) => {
    if (window.ethereum && account) {
      setLoading(true)
      console.log(`Updating message to ${message}...`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        contractAddress,
        HelloWorld.abi,
        signer
      )
      const transactionResponse = await contract.update(_message)
      setLoading(false)
      setConfirming(true)
      await transactionResponse.wait(1)
      setConfirming(false)
      console.log(transactionResponse)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateMessage(formMessage)
    setFormMessage('')
    await getMessage()
  }

  useEffect(() => {
    getMessage()
  }, [account])

  if (!window.ethereum) return <h1>Please isntall Metamask first</h1>
  return (
    <div className="App">
      <h1>Hello DApp</h1>
      <p>Contract Address: {contractAddress}</p>
      <p>Your account is: {account}</p>
      <p>Message from contract: {message}</p>

      {account ? (
        <>
          <button onClick={getMessage}>Get Message</button>
          <form onSubmit={handleSubmit}>
            <input
              name="formMessage"
              id="formMessage"
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
            />
            <button type="submit">
              {loading
                ? 'Updating...'
                : confirming
                ? 'Adding block to chain...'
                : 'Update Message'}
            </button>
          </form>
        </>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  )
}

export default App
