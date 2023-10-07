const Model = require("./Model.js")

class VideoLink extends Model {
    static get tableName() {
        return "videoLinks"
    }
    static get jsonSchema() {
        return {
            type: "object",
            required: ["fullUrl"],
            properties: {
                fullUrl: { type: "string", pattern: "https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)" },
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
                    from: "videoLinks.userId",
                    to: "users.id"
                }
            }
        }
    }
}

module.exports = VideoLink