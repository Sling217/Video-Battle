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
        table.bigInteger("userId").notNullable().unsigned().index().references("users.id")
        table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
        table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping table mainChannelQueue")
    return knex.schema.dropTableIfExists("mainChannelQueue")
}
