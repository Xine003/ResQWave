const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema ({
  name: "LoginVerification",
  tableName: "loginverifications",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    sessionID: {
      type: "varchar",
      unique: true,
      nullable: true
    },
    userID: {
      type: "varchar",
      nullable: false,
    },
    userType: {
      type: "varchar", // "dispatcher" or "focal"
      nullable: false,
    },
    code: {
      type: "varchar",
      length: 6,
      nullable: true,
    },
    expiry: {
      type: "timestamp",
      nullable: false,
    },
  },
});

