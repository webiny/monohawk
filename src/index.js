const fs = require("fs-extra");
const { blueBright } = require("chalk");
const getData = require("./getData");


module.exports = {
    inspect: async (folder, options = {}) => {
        return await getData(folder, options);
    },
    render: async (data, destination) => {
        console.log(`Rendering output to ${blueBright(destination)}`);
        await fs.writeFile(destination, JSON.stringify(data, null, 2));
    }
};
