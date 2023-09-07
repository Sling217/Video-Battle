/**
 * @typedef {import("knex")} Knex
 */

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
    return knex.schema.alterTable("videoLinks", (table) => {
        table.bigInteger("userId").nullable().alter()
        table.boolean('anonymousSubmission').defaultTo(false);
    })
    .raw(`
        ALTER TABLE "videoLinks"
        ADD CONSTRAINT "userId_xor_anonymousSubmission"
        CHECK (
            ("userId" IS NOT NULL AND "anonymousSubmission" = false)
            OR
            ("userId" IS NULL AND "anonymousSubmission" = true )
        )
    `);
}

/**
 * @param {Knex} knex
 */
exports.down = (knex) => {
    return knex.schema.alterTable("videoLinks", (table) => {
        table.bigInteger("userId").notNullable().alter()
    })
    .raw('ALTER TABLE "videoLinks" DROP CONSTRAINT "userId_xor_anonymousSubmission"')
    .then(() => knex.schema.table('videoLinks', (table) => {
        table.dropColumn('anonymousSubmission');
    }));
};
