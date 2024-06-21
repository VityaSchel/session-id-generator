import React from 'react'

export function Statistics({ generating, metrics, threads }: {
  generating: boolean
  metrics: number[] | null
  threads: number
}) {
  const [idsPerSecond, setIdsPerSecond] = React.useState<null | number>(null)

  React.useEffect(() => {
    if(metrics === null) {
      setIdsPerSecond(null)
    } else {
      setIdsPerSecond(
        Math.round(
          metrics.slice(-threads)
            .reduce((a, b) => a + b, 0)
        )
      )
    }
  }, [metrics, threads])

  return (
    <div className='flex gap-2 font-bold pl-3'>
      {generating ? (
        <>
          <span>Statistics:</span>
          <span className='tabular-nums'>{idsPerSecond} IDs/s</span>
        </>
      ) : (
        <span>Results:</span>
      )}
    </div>
  )
}