// getStats.js
import { Client, GatewayIntentBits, ChannelType, PermissionsBitField } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { getConfig, getRepoRoot } from '../org-stats/config-loader.js'

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const DISCORD_STATS_DIR = 'discord-stats';

// ——— Config from ENV ———
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
const BACKFILL = false     // ← flip to false once your one-off is done
const BACKFILL_YEAR = 2025     // ← year to backfill from January

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
})

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`)
  const guild = await client.guilds.fetch(GUILD_ID)
  const memberCount = guild.memberCount

  // Ensure all channels are fetched
  console.log(`🔄 Fetching all guild channels...`)
  await guild.channels.fetch()
  console.log(`✅ Guild channels loaded`)

  const botMember = await guild.members.fetch(client.user.id)
  const hasGuildViewPermission = botMember.permissions.has(PermissionsBitField.Flags.ViewChannel)
  console.log(`👁️  Bot has guild-level ViewChannel permission: ${hasGuildViewPermission}`)

  const allChannels = Array.from(guild.channels.cache.values())
  const allTextChannels = Array.from(guild.channels.cache.filter(c => c.isTextBased() && c.type !== ChannelType.GuildForum).values())
  console.log(`🔍 Found ${allTextChannels.length} text channels`)

  console.log(`
🧪 Testing channel access...`)
  const accessibleChannels = []
  const inaccessibleChannels = []

  for (const channel of allTextChannels) {
    try {
      await channel.messages.fetch({ limit: 1 })
      accessibleChannels.push(channel)
      console.log(`  ✅ ${channel.name} - Accessible`)
    } catch (err) {
      inaccessibleChannels.push(channel)
      console.log(`  ❌ ${channel.name} - Inaccessible: ${err.message}`)
    }
  }

  const channels = accessibleChannels

  // collect or load existing stats
  let data = {}
  if (fs.existsSync(OUTPUT_FILE)) {
    data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
  }

  console.log(`📊 ${channels.length} accessible channels will be processed.`)
  const now = new Date()

  const buckets = {}
  const processMessages = async (msgs, startDate, endDate) => {
    for (const msg of msgs.values()) {
      const ts = msg.createdAt
      if (ts < startDate) break
      if (ts < endDate) {
        const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`
        if (!buckets[key]) buckets[key] = { totalMessages: 0, uniquePosters: new Set() }
        buckets[key].totalMessages++
        if (!msg.author.bot) buckets[key].uniquePosters.add(msg.author.id)
      }
    }
  }

  const processChannel = async (channel, startDate, endDate) => {
    console.log(`📝 Processing channel: ${channel.name}`)
    let lastId = null
    while (true) {
      try {
        const msgs = await channel.messages.fetch({ limit: 100, before: lastId })
        if (!msgs.size) break
        await processMessages(msgs, startDate, endDate)
        lastId = msgs.last()?.id
        if (!lastId) break
        await new Promise(r => setTimeout(r, 500))
      } catch (e) {
        console.warn(`⚠️ Skipping channel ${channel.id} due to error: ${e.message}`)
        break
      }
    }
  }

  const startDate = BACKFILL ? new Date(BACKFILL_YEAR, 0, 1) : new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endDate = BACKFILL ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), now.getMonth(), 1)
  const targetKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`

  for (const channel of channels) {
    await processChannel(channel, startDate, endDate)
    if (channel.threads) {
      try {
        const threadGroups = [await channel.threads.fetchActive(), await channel.threads.fetchArchived({ limit: 100 })]
        for (const group of threadGroups) {
          for (const thread of group.threads.values()) {
            await processChannel(thread, startDate, endDate)
          }
        }
      } catch (e) {
        console.warn(`⚠️ Skipping threads for ${channel.name} due to: ${e.message}`)
      }
    }
  }

  if (BACKFILL) {
    console.log('🔄 Backfilling Jan → last full month of', BACKFILL_YEAR)
    for (let m = 0; m < now.getMonth(); m++) {
      const dt = new Date(BACKFILL_YEAR, m, 1)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const stats = buckets[key] || { totalMessages: 0, uniquePosters: new Set() }
      data[key] = {
        memberCount,
        totalMessages: stats.totalMessages,
        uniquePosters: stats.uniquePosters.size
      }
      console.log(`  → ${key}: ${stats.totalMessages} msgs, ${stats.uniquePosters.size} uniquePosters, ${memberCount} members`)
    }
  } else {
    const stats = buckets[targetKey] || { totalMessages: 0, uniquePosters: new Set() }
    data[targetKey] = {
      memberCount,
      totalMessages: stats.totalMessages,
      uniquePosters: stats.uniquePosters.size
    }
    console.log(`📊 Wrote stats for ${targetKey}: ${stats.totalMessages} msgs, ${stats.uniquePosters.size} uniquePosters, ${memberCount} members`)
  }

  // sort, write out, and exit
  const ordered = {}
  Object.keys(data).sort().forEach(k => { ordered[k] = data[k] })
  const outDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ordered, null, 2))
  console.log(`✅ Stats written to ${OUTPUT_FILE}`)
  process.exit(0)
})

client.login(DISCORD_TOKEN)