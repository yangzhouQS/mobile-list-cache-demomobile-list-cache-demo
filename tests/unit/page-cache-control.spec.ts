import { clearPageRefresh, consumePageRefresh, markPageRefresh } from '../../src/utils/page-cache-control'

describe('page-cache-control', () => {
  beforeEach(() => {
    clearPageRefresh()
  })

  test('mark then consume returns true once', () => {
    markPageRefresh('/order-list')
    expect(consumePageRefresh('/order-list')).toBe(true)
    // 标记被消费：再次读取为 false
    expect(consumePageRefresh('/order-list')).toBe(false)
  })

  test('consume without mark returns false', () => {
    expect(consumePageRefresh('/unknown')).toBe(false)
  })

  test('marks are per-route', () => {
    markPageRefresh('/a')
    markPageRefresh('/b')
    expect(consumePageRefresh('/a')).toBe(true)
    expect(consumePageRefresh('/b')).toBe(true)
    expect(consumePageRefresh('/c')).toBe(false)
  })

  test('clearPageRefresh removes all marks', () => {
    markPageRefresh('/a')
    markPageRefresh('/b')
    clearPageRefresh()
    expect(consumePageRefresh('/a')).toBe(false)
    expect(consumePageRefresh('/b')).toBe(false)
  })
})
