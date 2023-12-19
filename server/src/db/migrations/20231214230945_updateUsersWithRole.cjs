/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Adding column role to users")
    return knex.schema.alterTable("users", (table) => {
        table.string("role").notNullable().defaultTo("guest")
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping column role from users")
    return knex.schema.table("users", (table) => {
        table.dropColumn("role")
    })
}
