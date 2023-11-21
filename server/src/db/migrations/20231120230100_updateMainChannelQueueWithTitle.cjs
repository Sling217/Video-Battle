/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Adding column title to mainChannelQueue")
    return knex.schema.alterTable("mainChannelQueue", (table) => {
        table.string("title").notNullable()
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping column title from mainChannelQueue")
    return knex.schema.table("mainChannelQueue", (table) => {
        table.dropColumn("title")
    })
}