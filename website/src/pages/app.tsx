import React from 'react'
import { Info } from '@/widgets/info'
import { Settings } from '@/features/settings'
import { Statistics } from '@/widgets/statistics'
import { Results } from '@/widgets/results'
import { useComplexState } from '@/shared/complex-state'

export function App() {
  const [metrics, setMetrics, metricsRef] = useComplexState<number[] | null>(null)
  const [threads, setThreads] = React.useState<number>(Math.ceil(navigator.hardwareConcurrency / 3))
  const [results, setResults, resultsRef] = useComplexState<{ filter: string, id: string, mnemonic: string }[]>([])
  const [generating, setGenerating] = React.useState(false)

  return (
    <div className='flex w-full items-center justify-center min-h-[100svh] px-4 py-12'>
      <div className='flex flex-col 910:flex-row gap-10 max-w-full'>
        <div className='flex flex-col gap-4 w-[430px] max-w-full'>
          <Info />
          <Settings 
            generating={generating}
            setGenerating={setGenerating}
            threads={threads}
            setThreads={setThreads}
            onResult={(newResult) => setResults([newResult, ...resultsRef.current])}
            onMetricsUpdate={(n: number) => setMetrics([...(metricsRef.current ?? []), n])}
            onReset={() => setMetrics([])}
          />
        </div>
        <div className='flex flex-col gap-2 w-96 max-w-full'>
          <Statistics 
            generating={generating}
            threads={threads}
            metrics={metrics} 
          />
          <Results
            generating={generating}
            results={results}
            onClear={() => setResults([])}
          />
        </div>
      </div>
    </div>
  )
}