const Model = require("./Model.js")

class MainChannelQueue extends Model {
    static get tableName() {
        return "mainChannelQueue"
    }
    static get jsonSchema() {
        return {
            type: "object",
            required: ["fullUrl"],
            properties: {
                fullUrl: { type: "string", pattern: "" },
                userId: { type: ["integer", "string"] },
                anonymousSubmission: { type: "boolean" }
            },
            allOf: [
                {
                    "if": {
                        "properties": {"anonymousSubmission": {"const": true}},
                        "required": ["anonymousSubmission"],
                    },
                    "then": {"properties": {"userId": {"const": null}}},
                },
                {
                    "if": {
                        "properties": {"anonymousSubmission": {"const": false}},
                        "required": ["anonymousSubmission"],
                    },
                    "then": {"properties": {"userId": {"type": "integer"}}},
                },
            ],
        }
    }

    static get relationMappings() {
        const { User } = require("./index.js")
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "mainChannelQueue.userId",
                    to: "users.id"
                }
            }
        }
    }
}

module.exports = MainChannelQueue