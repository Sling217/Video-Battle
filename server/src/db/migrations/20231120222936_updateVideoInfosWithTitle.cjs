/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Adding column title to videoInfos")
    return knex.schema.alterTable("videoInfos", (table) => {
        table.string("title").notNullable()
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping column title from videoInfos")
    return knex.schema.table("videoInfos", (table) => {
        table.dropColumn("title")
    })
}