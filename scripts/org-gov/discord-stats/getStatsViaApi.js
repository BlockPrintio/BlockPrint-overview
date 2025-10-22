// getStats.js - Updated to use API endpoint
import fs from 'fs'
import path from 'path'
import { getConfig, getRepoRoot } from '../org-stats/config-loader.js'

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const DISCORD_STATS_DIR = 'discord-stats';

// ——— Config from ENV ———
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

// Get config and repository root
const config = getConfig();
const repoRoot = getRepoRoot();
const OUTPUT_FILE = path.join(repoRoot, BASE_DIR, DISCORD_STATS_DIR, 'stats.json')

// Get guild ID from config
const GUILD_ID = config.discordGuildId

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error('❌ DISCORD_TOKEN must be set and discordGuildId must be configured in org-stats-config.json')
  process.exit(1)
}

// ——— Backfill toggle ———
const BACKFILL = process.env.BACKFILL === 'true' || false
const BACKFILL_YEAR = parseInt(process.env.BACKFILL_YEAR || '2025', 10)

async function fetchDiscordEngagementStats() {
  console.log('🔄 Fetching Discord engagement stats from API...')

  // Build query parameters for engagement API
  const params = new URLSearchParams({
    guild_id: GUILD_ID
  })

  // Add date parameters for backfill if needed
  if (BACKFILL) {
    const startDate = new Date(BACKFILL_YEAR, 0, 1).toISOString() // Start of year
    const endDate = new Date(BACKFILL_YEAR, 11, 31, 23, 59, 59, 999).toISOString() // End of year

    params.append('start', startDate)
    params.append('end', endDate)
    params.append('interval', '3') // 3-day intervals (monthly data)

    console.log(`📅 Backfilling engagement data from ${BACKFILL_YEAR}`)
  } else {
    // For current month, the API will use defaults
    console.log('📅 Fetching current month engagement data')
  }

  const url = `${API_BASE_URL}/api/discord/engagement?${params.toString()}`
  console.log(`🌐 Calling engagement API: ${url}`)

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': DISCORD_TOKEN,
        'Accept': '*/*'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`API returned error: ${data.error}`)
    }

    console.log('✅ Successfully fetched engagement data')
    return data
  } catch (error) {
    console.error('❌ Failed to fetch Discord engagement stats:', error.message)
    throw error
  }
}

function processEngagementData(rawData) {
  // Transform the API response to match the expected format
  // API returns array of daily data, we need to aggregate by month
  const monthlyData = {}

  for (const dayData of rawData) {
    const date = new Date(dayData.day_pt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        totalMessages: 0,
        uniquePosters: 0, // communicators
        memberCounts: [], // collect all approximate_member_count values
        totalVisitors: 0,
        totalCommunicators: 0,
        daysCounted: 0
      }
    }

    monthlyData[monthKey].totalMessages += dayData.messages || 0
    monthlyData[monthKey].totalVisitors += dayData.visitors || 0
    monthlyData[monthKey].totalCommunicators += dayData.communicators || 0
    if (typeof dayData.approximate_member_count === 'number') {
      monthlyData[monthKey].memberCounts.push(dayData.approximate_member_count)
    }
    monthlyData[monthKey].daysCounted += 1
  }

  // Calculate averages and finalize the data
  const processedData = {}
  for (const [monthKey, data] of Object.entries(monthlyData)) {
    // Use the maximum approximate_member_count for the month, or fallback to average visitors if not available
    let memberCount = 0
    if (data.memberCounts.length > 0) {
      memberCount = Math.max(...data.memberCounts)
    } else {
      memberCount = Math.round(data.totalVisitors / data.daysCounted)
    }
    processedData[monthKey] = {
      memberCount,
      totalMessages: data.totalMessages,
      uniquePosters: Math.round(data.totalCommunicators / data.daysCounted) // Average daily communicators
    }
  }

  return processedData
}

async function main() {
  try {
    // Load existing data if file exists
    let data = {}
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log(`📂 Loading existing stats from ${OUTPUT_FILE}`)
      data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
    }

    // Fetch new engagement stats from API
    const rawStats = await fetchDiscordEngagementStats()

    // Process the raw data to match expected format
    const processedStats = processEngagementData(rawStats)

    // Merge with existing data
    const updatedData = { ...data, ...processedStats }

    // Write to file
    const outDir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(outDir)) {
      console.log(`📁 Creating output directory: ${outDir}`)
      fs.mkdirSync(outDir, { recursive: true })
    }

    // Sort the data by month keys
    const ordered = {}
    Object.keys(updatedData).sort().forEach(k => { ordered[k] = updatedData[k] })

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ordered, null, 2))
    console.log(`✅ Stats written to ${OUTPUT_FILE}`)

    // Log summary
    const monthKeys = Object.keys(processedStats)
    console.log(`📊 Updated stats for months: ${monthKeys.join(', ')}`)

    for (const [monthKey, stats] of Object.entries(processedStats)) {
      console.log(`  → ${monthKey}: ${stats.totalMessages} msgs, ${stats.uniquePosters} uniquePosters, ${stats.memberCount} members`)
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
