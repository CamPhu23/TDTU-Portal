const accountModel = require('./models/accountModel')

module.exports = {
    getAuthorization: async (accountId) => {
        let authorization = 3

        await accountModel.findById(accountId)
        .then(account => {

            if (account) {
                if (account.permission == "admin") {
                    authorization = 1
                } else {
                    authorization = 2
                }
            }
        })
        .catch(error => console.log(error))

        console.log(authorization);

        return authorization
    }
}