import React, { useEffect, useState } from 'react'
import { useLocation } from './hooks/useLocation'
import { useWeatherData } from './hooks/useWeatherData'
import { useAuth } from './hooks/useAuth'
import { isPushConfigured, subscribePush, unsubscribePush, sendTestNotification } from './lib/push'
import { usePreferences } from './hooks/usePreferences'
import { CurrentWeather } from './components/CurrentWeather'
import { Timeline } from './components/Timeline'
import { WorkableHours } from './components/WorkableHours'
import { AlertBanner } from './components/AlertBanner'
import { Diagnostics } from './components/Diagnostics'

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  return (
    <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} className="btn-primary" aria-pressed={theme === 'dark'} aria-label="テーマ切替">
      {theme === 'dark' ? 'ライト' : 'ダーク'}
    </button>
  )
}

function App() {
  const { userId, configured, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth()
  const { location, loading: locationLoading, error: locationError } = useLocation()
  const { currentWeather, hourlyWeather, loading: weatherLoading, error: weatherError, refresh } = useWeatherData(location, userId)
  const { timeWindowStart, timeWindowEnd, setNotifications } = usePreferences(userId)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (locationLoading || (!currentWeather && weatherLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <p className="text-gray-600 dark:text-gray-300">天気データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (locationError || weatherError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{locationError || weatherError}</p>
            <button onClick={refresh} className="btn-primary">再試行</button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentWeather) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold">🌾 佐渡農作業天気</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isPushConfigured ? (
              userId ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        const sub = await subscribePush(userId)
                        await sendTestNotification(sub, { title: 'テスト通知', body: '設定が有効です' })
                        await setNotifications(true)
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                  >通知オン（テスト）</button>
                  <button className="btn-primary" onClick={async () => { await unsubscribePush(); await setNotifications(false) }}>通知オフ</button>
                </>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">ログインで通知設定可能</span>
              )
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">Push未設定</span>
            )}
            {!configured ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">Supabase未設定</span>
            ) : userId ? (
              <button className="btn-primary" onClick={() => signOut()}>ログアウト</button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  signIn(email, password)
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <button type="submit" className="btn-primary" disabled={authLoading}>ログイン</button>
                <button type="button" className="btn-primary" onClick={() => signUp(email, password)} disabled={authLoading}>登録</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {authError && <div className="card text-red-600">{authError}</div>}
        <AlertBanner alerts={[]} />
        <Diagnostics currentWeather={currentWeather} hourlyWeather={hourlyWeather} />
        <CurrentWeather weather={currentWeather} onRefresh={refresh} loading={weatherLoading} />
        <WorkableHours hourlyData={hourlyWeather} startHour={timeWindowStart} endHour={timeWindowEnd} />
        <Timeline hourlyData={hourlyWeather} />
      </main>
      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>データ提供: Open-Meteo</p>
        <p className="mt-1">天気は急変する可能性があります。作業中も空模様に注意してください。</p>
      </footer>
    </div>
  )
}

export default App
