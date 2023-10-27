const Model = require("./Model.js")

class MainChannelChat extends Model {
    static get tableName() {
        return "mainChannelChats"
    }
    static get jsonSchema() {
        return {
            type: "object",
            required: ["content", "username"],
            properties: {
                content: { type: "string" },
                userId: { type: ["integer", "string"] },
                username: { type: "string" }
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
                    from: "mainChannelChats.userId",
                    to: "users.id"
                }
            }
        }
    }
}

module.exports =  MainChannelChat