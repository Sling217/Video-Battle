/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    console.log("Creating table videoInfos")
    return knex.schema.createTable("videoInfos", (table) => {
        table.bigIncrements("id")
        table.text("fullUrl").notNullable()
        table.integer("duration")
        table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
        table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
    })
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    console.log("Dropping table videoInfos")
    return knex.schema.dropTableIfExists("videoInfos")
}
