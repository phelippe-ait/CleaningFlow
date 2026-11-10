import type { Access, CollectionConfig } from "payload"

const isUser = (user: unknown): user is {
  collection: "users"
  id: string
  role?: string
} =>
  typeof user === "object" &&
  user !== null &&
  "collection" in user &&
  user.collection === "users"

const isManager: Access = ({ req }) =>
  isUser(req.user) && req.user.role === "manager"

const isSelfOrManager: Access = ({ req }) => {
  if (!isUser(req.user)) return false
  if (req.user.role === "manager") return true
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    group: "CleanFlow",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "phone"],
  },
  access: {
    create: isManager,
    read: isSelfOrManager,
    update: isSelfOrManager,
    delete: isManager,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "cleaner",
      options: [
        { label: "Manager", value: "manager" },
        { label: "Cleaner", value: "cleaner" },
      ],
      access: {
        create: () => false,
        update: ({ req }) => isUser(req.user) && req.user.role === "manager",
      },
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "hourlyRate",
      type: "number",
      min: 0,
      access: {
        create: ({ req }) => isUser(req.user) && req.user.role === "manager",
        read: ({ req }) => isUser(req.user),
        update: ({ req }) => isUser(req.user) && req.user.role === "manager",
      },
    },
  ],
}
