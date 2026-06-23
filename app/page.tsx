'use client';

import { useDigitsTrading } from '../hooks/use-digits-trading';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { useLogoSrc } from '@/components/custom/logo-src-provider';
import { BotDashboard } from '../components/bot-dashboard/bot-dashboard';
import { Header } from '@/components/custom/header';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { Footer } from '@/components/custom/footer';

export default function DigitsPage() {
  const logoSrc = useLogoSrc();
  const { ws, isConnected, isExhausted, auth } = useDerivWSContext();
  const { authState, accounts, activeAccount, login, signUp, logout, switchAccount } = auth;

  const trading = useDigitsTrading({ ws, isConnected, isExhausted, isAuthenticated: !!auth.wsUrl, onAuthWSFailed: logout });

  return (
    <main className="flex flex-col bg-background h-dvh overflow-hidden">
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={login}
        onSignUp={signUp}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        logoSrc={logoSrc}
        appName="THPDTSMRTTRDR"
        actions={<ThemeToggle />}
      />
      
      {/* Spacer to push content below fixed header */}
      <div className={authState === 'authenticated' ? 'h-[76px] shrink-0' : 'h-[66px] shrink-0'} />

      <BotDashboard
        ws={ws}
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={login}
        onSignUp={signUp}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        logoSrc={logoSrc}
        isConnected={trading.isConnected}
        isLoading={trading.isLoading}
        error={trading.error}
        symbols={trading.symbols}
        activeSymbol={trading.activeSymbol}
        selectSymbol={trading.selectSymbol}
        currentTick={trading.currentTick}
        lastDigit={trading.lastDigit}
        digitStats={trading.digitStats}
        pipSize={trading.pipSize}
        tradeType={trading.tradeType}
        setTradeType={trading.setTradeType}
        contractMode={trading.contractMode}
        setContractMode={trading.setContractMode}
        selectedDigit={trading.selectedDigit}
        setSelectedDigit={trading.setSelectedDigit}
        stake={trading.stake}
        setStake={trading.setStake}
        duration={trading.duration}
        setDuration={trading.setDuration}
        durationLimits={trading.durationLimits}
        proposal={trading.proposal}
        isProposalLoading={trading.isProposalLoading}
        buyContract={trading.buyContract}
        isBuying={trading.isBuying}
        buyResult={trading.buyResult}
        buyError={trading.buyError}
        clearBuyResult={trading.clearBuyResult}
        openPositions={trading.openPositions}
        closedPositions={trading.closedPositions}
      />

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 py-2 text-center bg-background/80 backdrop-blur-sm z-50 border-t border-border">
        <Footer />
      </div>
    </main>
  );
}
