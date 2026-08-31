import { resolveChannel } from "./utils"

const arg = process.argv[2]
const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const appId = channel === "prod" ? "com.opengravity.desktop" : `com.opengravity.desktop.${channel}`
const productName = channel === "prod" ? "OpenGravity" : `OpenGravity ${channel.charAt(0).toUpperCase() + channel.slice(1)}`
const summary = `Open source AI coding workspace${channel !== "prod" ? ` (${channel})` : ""}`

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${appId}</id>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MIT</project_license>

  <name>${productName}</name>
  <summary>${summary}</summary>

  <developer id="ai.opengravity">
    <name>OpenGravity Team</name>
  </developer>

  <description>
    <p>
      OpenGravity is an agentic AI coding workspace powered by the OpenCode engine with an Antigravity-inspired workflow.
    </p>
  </description>

  <launchable type="desktop-id">${appId}.desktop</launchable>

  <content_rating type="oars-1.1" />

  <url type="bugtracker">https://github.com/anomalyco/opencode/issues</url>
  <url type="homepage">https://opencode.ai</url>
  <url type="vcs-browser">https://github.com/anomalyco/opencode</url>

  <screenshots>
    <screenshot type="default">
      <image>https://raw.githubusercontent.com/anomalyco/opencode/b75d4d1c5ec449585d515c756fc81f080a157a9a/packages/web/src/assets/lander/screenshot.png</image>
    </screenshot>
  </screenshots>
</component>
`

await Bun.write(`resources/${appId}.metainfo.xml`, xml)
console.log(`Generated metainfo for ${channel} at resources/${appId}.metainfo.xml`)
