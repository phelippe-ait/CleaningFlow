import path from "path"
import { buildFigmaConfig } from "@payloadcms/figma"
import { mcpPlugin } from "@payloadcms/plugin-mcp"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { sqliteAdapter } from "@payloadcms/db-sqlite"
import { en as adminLanguage } from "@payloadcms/translations/languages/en"
import { fileURLToPath } from "url"
import { Admins } from "./collections/Admins"
import { Media } from "./collections/Media"
import { Folders } from "./collections/Folders"
import { Tags } from "./collections/Tags"
import { Posts } from "./collections/Posts"
import { Users } from "./collections/Users"
import { Clients } from "./collections/Clients"
import { Properties } from "./collections/Properties"
import { Jobs } from "./collections/Jobs"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const supabaseDatabaseUrl = process.env.SUPABASE_DATABASE_URL

export default buildFigmaConfig({
  db: supabaseDatabaseUrl
    ? postgresAdapter({
        pool: { connectionString: supabaseDatabaseUrl },
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URI || "file:./cleaningflow.db",
        },
      }),
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: "activity", width: "full" },
        { widgetSlug: "collections", width: "full" },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: "en",
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    Posts,
    Users,
    Clients,
    Properties,
    Jobs,
  ],
  localization: {
    locales: [{ code: "en", label: "English" }],
    fallback: true,
    defaultLocale: "en",
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [mcpPlugin({})],
  figma: {
    contentSystemId:
      process.env.FIGMA_CONTENT_API_CONTENT_SYSTEM_ID || "local-dev",
    environmentId: process.env.FIGMA_EID || "local-dev",
    useContentSystem: false,
    storage: false,
  },
})
