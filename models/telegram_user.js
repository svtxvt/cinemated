const users = [];

module.exports = {

    async insert(user_id) {
        users.push(user_id);
    },

    async getById(user_id) {
        return users.find(x => x === user_id);
    },

    async getAll() {
        return users;
    }

};
