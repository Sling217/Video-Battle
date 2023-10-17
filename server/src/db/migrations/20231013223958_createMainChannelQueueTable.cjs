/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Creating table mainChannelQueue")
    return knex.schema.createTable("mainChannelQueue", (table) => {
        table.bigIncrements("id")
        table.text("fullUrl").notNullable()
        table.bigInteger("userId").unsigned().index().references("users.id")
        table.boolean("anonymousSubmission").defaultTo(false)
        table.integer("duration")
        table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
        table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
    })
    .raw(`
        ALTER TABLE "mainChannelQueue"
        ADD CONSTRAINT "userId_xor_anonymousSubmission"
        CHECK (
            ("userId" IS NOT NULL AND "anonymousSubmission" = false)
            OR
            ("userId" IS NULL AND "anonymousSubmission" = true)
        )
    `)
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping table mainChannelQueue")
    return knex.schema.dropTableIfExists("mainChannelQueue")
}
