const Model = require("./Model.js")

class VideoLink extends Model {
    static get tableName() {
        return "videoLinks"
    }
    static get jsonSchema() {
        return {
            type: "object",
            required: ["fullUrl", "userId"],
            properties: {
                fullUrl: { type: "string" },
                userId: { type: ["integer", "string"]}
            }
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