/* eslint-disable import/no-extraneous-dependencies */
const Bcrypt = require("bcrypt");
const unique = require("objection-unique");
const Model = require("./Model");

const saltRounds = 10;

const uniqueFunc = unique({
  fields: ["email"],
  identifiers: ["id"],
});

class User extends uniqueFunc(Model) {
  static get tableName() {
    return "users";
  }

  set password(newPassword) {
    this.cryptedPassword = Bcrypt.hashSync(newPassword, saltRounds);
  }

  authenticate(password) {
    return Bcrypt.compareSync(password, this.cryptedPassword);
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "username"],
      properties: {
        email: { type: "string", pattern: "^\\S+@\\S+\\.\\S+$" },
        cryptedPassword: { type: "string" },
        username: { type: "string" },
        role: { type: "string" }
      },
    };
  }

  static get relationMappings() {
    const { VideoLink, MainChannelQueue, MainChannelChat } = require("./index.js")
    return {
      videoLinks: {
        relation: Model.HasManyRelation,
        modelClass: VideoLink,
        join: {
          from: "users.id",
          to: "videoLinks.userId"
        }
      },
      videoQueue: {
        relation: Model.HasManyRelation,
        modelClass: MainChannelQueue,
        join: {
          from: "users.id",
          to: "mainChannelQueue.userId"
        }
      },
      mainChannelChats: {
        relation: Model.HasManyRelation,
        modelClass: MainChannelChat,
        join: {
          from: "users.id",
          to: "mainChannelChats.userId"
        }
      }
    }
  }

  $formatJson(json) {
    const serializedJson = super.$formatJson(json);

    if (serializedJson.cryptedPassword) {
      delete serializedJson.cryptedPassword;
    }

    return serializedJson;
  }
}

module.exports = User;
