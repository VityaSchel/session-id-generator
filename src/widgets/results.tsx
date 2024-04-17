import copy from 'copy-to-clipboard'
import cx from 'classnames'

export function Results({ generating, results, onClear }: {
  generating: boolean
  results: { filter: string, id: string, mnemonic: string }[]
  onClear: () => void
}) {
  return (
    <div className='relative'>
      <div className='flex flex-col gap-2 overflow-auto bg-neutral-900 border border-solid border-neutral-800 p-4 rounded-xl shadow-[0px_0px_0px_1px_black] h-[326px] max-h-[326px] relative'>
        {results.length ? (
          results.map(result => (
            <div className='flex flex-col gap-2 border border-solid border-neutral-600 p-2 rounded-md' key={result.id}>
              <span className='font-mono block [overflow-wrap:break-word] text-[16px]'>{result.id}</span>
              <div className='flex items-end gap-2'>
                <div className='flex flex-col flex-1'>
                  <span className='text-sm'>Filter:</span>
                  <span className='font-mono text-ellipsis text-xs whitespace-nowrap overflow-hidden block max-w-[210px]'>{result.filter}</span>
                </div>
                <button className='shrink-0' onClick={() => copy(result.mnemonic)}>Copy mnemonic</button>
              </div>
            </div>
          ))
        ) : (
          <span className='text-neutral-600 pointer-events-none select-none pl-3 py-2'>
            {generating ? 'Bruteforcing Session IDs...' : 'Click start to start bruteforcing'}
          </span>
        )}
      </div>
      <button 
        className={cx('absolute bottom-[calc(100%+10px)] right-3 transition-opacity duration-200', {
          'opacity-0 pointer-events-none': !results.length
        })}
        onClick={onClear}
      >Clear</button>
    </div>
  )
}