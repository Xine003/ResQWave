const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "SensorData",
    tableName: "sensor_data",
    columns: {
        ID: {
            primary: true,
            type: "int",
            generated: true,
        },
        status: {
            type: "boolean",
            default: false,
        },
    },
});
