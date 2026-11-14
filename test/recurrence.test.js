import test from 'node:test'
import assert from 'node:assert/strict'
import { addAnnualPredictions } from '../src/domain/recurrence.js'

const item = (id, title, nodes) => ({
  id, title, category: id.includes('cet') ? 'certificate' : 'competition', description: '',
  majors: [], interests: [], years: [], regions: [], registrationStatus: 'unknown',
  sourceUrl: '', verifiedAt: '', notes: '', demo: false, nodes,
})

test('fills predicted month anchors for stable annual cycles without claiming official confirmation', () => {
  const state = { version: 1, profile: {}, items: [
    item('cet-6', '英语六级（CET-6）', [{ id: 'cet-exam', type: 'exam', start: null, end: null, confidence: 'unknown' }]),
    item('cet-dec', '全国大学英语六级考试（CET-6）', [{ id: 'cet-dec-exam', type: 'exam', start: null, end: null, confidence: 'unknown' }]),
    item('csp', 'CCF CSP 软件能力认证', [{ id: 'csp-exam', type: 'exam', start: null, end: null, confidence: 'unknown' }]),
    item('csp-contest', 'CCF 大学生计算机竞赛（CSP 竞赛赛道）', [{ id: 'csp-contest-node', type: 'competition', start: null, end: null, confidence: 'unknown' }]),
    item('variable', 'ICPC/CCPC 区域赛', [{ id: 'regional', type: 'competition', start: null, end: null, confidence: 'unknown' }]),
  ], favorites: [], reminders: [] }
  const next = addAnnualPredictions(state, 2027)
  const cetNode = next.items[0].nodes[0]
  assert.equal(cetNode.start, '2027-06-01')
  assert.equal(cetNode.accuracy, 'month')
  assert.equal(cetNode.confidence, 'predicted')
  assert.match(cetNode.note, /NEEA|教育考试院/)
  assert.equal(next.items[1].nodes[0].start, '2027-12-01')
  assert.equal(next.items[1].nodes[0].accuracy, 'month')
  assert.equal(next.items[1].nodes[0].confidence, 'predicted')
  assert.deepEqual(next.items[2].nodes.map(node => node.start), ['2027-03-01', '2027-05-01', '2027-09-01', '2027-12-01'])
  assert.ok(next.items[2].nodes.every(node => node.accuracy === 'month' && node.confidence === 'predicted'))
  assert.equal(next.items[3].nodes[0].start, null, '竞赛赛道活动时间不能套用认证考试节奏')
  assert.equal(next.items[3].nodes[0].confidence, 'unknown')
  assert.equal(next.items[4].nodes[0].start, null, '浮动场次不能按统一月份冒充有规律')
  assert.equal(next.items[4].nodes[0].confidence, 'unknown')
})

test('leaves existing dates untouched, removes redundant undated placeholders, and stays idempotent', () => {
  const state = { version: 1, profile: {}, items: [item('cet-6', '英语六级（CET-6）', [{ id: 'exam', type: 'exam', start: null, end: null, confidence: 'unknown' }])], favorites: [], reminders: [] }
  const once = addAnnualPredictions(state, 2027)
  const twice = addAnnualPredictions(once, 2027)
  assert.deepEqual(twice, once)
  assert.equal(once.items[0].nodes.length, 1, 'single generic CET entry represents the next sitting only')
  assert.equal(once.items[0].nodes[0].start, '2027-06-01')
  assert.equal(addAnnualPredictions({ ...state, items: [{ ...state.items[0], nodes: [{ ...state.items[0].nodes[0], start: '2027-12-01', accuracy: 'month' }] }] }, 2027).items[0].nodes[0].start, '2027-12-01')
})
