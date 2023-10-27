/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Creating table mainChannelChats")
    return knex.schema.createTable("mainChannelChats", (table) => {
        table.bigIncrements("id")
        table.string("username").notNullable()
        table.text("content").notNullable()
        table.bigInteger("userId").unsigned().index().references("users.id")
        table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
        table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping table mainChannelChats")
    return knex.schema.dropTableIfExists("mainChannelChats")
}
