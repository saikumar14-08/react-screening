'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Connection, PublicKey } from '@solana/web3.js'

interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
}

export function PortfolioDashboard() {
  const { account, cluster } = useWalletUi()

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchPortfolioData = useCallback(async () => {
    if (!account?.address) {
      console.warn('Invalid wallet account:', account)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const connection = new Connection('https://api.devnet.solana.com')
      const publicKey = new PublicKey(account.address)
      console.log('Fetching portfolio data for account:', account.address)
      const lamports = await connection.getBalance(publicKey)
      const balance = lamports / 1_000_000_000

      //   const solPriceUsd = await getSolPriceUsd()
      // const totalValue = balance * solPriceUsd

      const realData: PortfolioData = {
        balance,
        tokens: [],
        totalValue: 0,
      }

      setPortfolio(realData)
    } catch (err) {
      console.error('fetchPortfolioData error:', err)
      setError('Failed to fetch portfolio data')
    } finally {
      setIsLoading(false)
    }
  }, [account?.address])

  //   const getSolPriceUsd = async (): Promise<number> => {
  //   try {
  //     const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
  //     const data = await res.json()
  //     return data.solana.usd || 0
  //   } catch (err) {
  //     console.error('Failed to fetch SOL price:', err)
  //     return 0
  //   }
  // }

  useEffect(() => {
    if (account?.address && isMounted) {
      fetchPortfolioData()
    }
  }, [account?.address, fetchPortfolioData, isMounted])

  if (!isMounted) return null

  if (!account?.address && !isLoading) {
    return (
      <div className="p-2">
        <h1 className="text-6xl font-bold mb-2">Portfolio Dashboard - Please Connect Wallet</h1>
        <div className="bg-yellow-200 p-8 rounded border-4 border-yellow-500">
          <p className="text-2xl font-bold">
            ⚠️ WALLET CONNECTION REQUIRED - Please connect your Solana wallet to view your portfolio.
          </p>
        </div>
      </div>
    )
  }

  const formatBalance = (balance: number) => balance.toFixed(2)

  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-violet-700 dark:text-violet-300 leading-tight tracking-tight">
        My Portfolio Dashboard for Cryptocurrency Assets
      </h1>

      <div className="flex flex-wrap gap-6">
        {/* SOL Balance */}
        <Card className="min-w-80 flex-1 max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-violet-700 dark:text-violet-300">
              SOL Balance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-base font-medium text-gray-600">Loading your balance...</div>
            ) : (
              <div>
                <p className="text-4xl font-bold text-violet-800 dark:text-violet-200">{portfolio.balance} SOL</p>
                <p className="text-sm text-gray-500 mt-1">Current Network: {cluster?.label || 'Unknown'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Holdings */}
        <Card className="min-w-96 flex-1 max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-violet-700 dark:text-violet-300 whitespace-nowrap">
              Token Holdings & Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.tokens.length === 0 ? (
              <p className="text-base font-medium text-gray-600">No tokens found in wallet</p>
            ) : (
              <div className="space-y-4">
                {portfolio.tokens.map((token, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                        {token.symbol || 'Unknown Token'}
                      </span>
                      <p className="text-sm text-gray-500 font-mono">{token.mint}</p>
                    </div>
                    <span className="text-base font-mono text-violet-600 dark:text-violet-300 whitespace-nowrap">
                      {token.amount} tokens
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card className="min-w-72 flex-1 max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-violet-700 dark:text-violet-300">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              ${portfolio.totalValue.toFixed(2)} USD
            </p>
            <Button
              onClick={fetchPortfolioData}
              disabled={isLoading}
              className="mt-6 w-full text-base font-semibold py-3"
            >
              Refresh Portfolio Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
