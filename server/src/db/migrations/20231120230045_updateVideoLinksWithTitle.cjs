/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Adding column title to videoLinks")
    return knex.schema.alterTable("videoLinks", (table) => {
        table.string("title").notNullable()
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping column title from videoLinks")
    return knex.schema.table("videoLinks", (table) => {
        table.dropColumn("title")
    })
}