import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { buildMonthIndex, filterItems } from '../src/domain/filter.js'

function makeFixture(count = 1000) {
  return Array.from({ length: count }, (_, index) => {
    const day = String((index % 28) + 1).padStart(2, '0')
    return {
      id: `benchmark-${index}`,
      title: `赛事 ${index}`,
      category: index % 2 ? 'competition' : 'certificate',
      majors: index % 3 ? ['计算机科学'] : ['设计学'],
      years: [],
      interests: index % 5 ? ['创新创业'] : ['艺术设计'],
      regions: [],
      registrationStatus: index % 4 ? 'open' : 'unknown',
      nodes: [{
        id: `node-${index}`,
        type: 'registration_deadline',
        start: index % 17 ? `2026-11-${day}` : null,
        end: null,
        confidence: index % 17 ? 'pending_confirmation' : 'unknown',
        note: '',
      }],
    }
  })
}

function percentile(values, fraction) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)]
}

test('benchmark: filters and indexes 1,000 local items across 100 deterministic samples', t => {
  const items = makeFixture()
  const profile = { major: '计算机科学', year: '', province: '', interests: ['创新创业'], types: [] }
  const filters = { query: '', category: 'all', major: 'all', province: 'all', status: 'all', from: '', to: '', onlySuitable: false }
  const samples = []
  let finalVisible = []
  let finalIndex

  for (let sample = 0; sample < 100; sample += 1) {
    const startedAt = performance.now()
    finalVisible = filterItems(items, filters, profile)
    finalIndex = buildMonthIndex(finalVisible, new Date(2026, 10, 1))
    samples.push(performance.now() - startedAt)
  }

  const p50 = percentile(samples, 0.5)
  const p95 = percentile(samples, 0.95)
  assert.equal(finalVisible.length, 1000)
  assert.ok(finalIndex instanceof Map)
  assert.ok(finalIndex.get('2026-11-01')?.length > 0)
  assert.ok(Number.isFinite(p50) && Number.isFinite(p95))
  t.diagnostic(`1,000 items × 100 samples: p50=${p50.toFixed(2)}ms, p95=${p95.toFixed(2)}ms (informational target: p95 <16ms locally)`)
})
