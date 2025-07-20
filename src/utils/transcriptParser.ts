import type { TranscriptLine } from '@/types'

export function parseTranscriptLine(line: string): TranscriptLine | null {
  const regex = /\[\s*(\d+)m(\d+)s(\d+)ms\s*-\s*(\d+)m(\d+)s(\d+)ms\s*\]\s*(.+)/
  const match = line.match(regex)
  
  if (!match) return null
  
  const [, startMin, startSec, startMs, endMin, endSec, endMs, text] = match
  
  const startTime = parseInt(startMin) * 60 + parseInt(startSec) + parseInt(startMs) / 1000
  const endTime = parseInt(endMin) * 60 + parseInt(endSec) + parseInt(endMs) / 1000
  
  return {
    startTime,
    endTime,
    text: text.trim()
  }
}

export async function loadTranscript(): Promise<TranscriptLine[]> {
  try {
    const response = await fetch('/data/transcript.txt')
    const text = await response.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines
      .map(parseTranscriptLine)
      .filter((line): line is TranscriptLine => line !== null)
  } catch (error) {
    console.error('Failed to load transcript:', error)
    return []
  }
}