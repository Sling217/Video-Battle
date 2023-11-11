const Model = require("./Model.js")

class VideoInfo extends Model {
    static get tableName() {
        return "videoInfos"
    }
    static get jsonSchema() {
        return {
            type: "object",
            required: ["fullUrl"],
            properties: {
                fullUrl: { type: "string", pattern: "https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)" },
                duration: { type: "integer" }
            }
        }
    }

    static get relationMappings() {
        return {}
    }
}

module.exports = VideoInfo