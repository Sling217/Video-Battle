import { User } from "../../models/index.js";

class UsersSeeders { 
    static async seed() {
        const user = {
            email: "Admin@example.com"
        }
        const role = {
            role: "admin"
        }
        const findUser = await User.query().findOne(user)
        if (findUser) {
            await findUser.$query().patch(role)
        } else {
            console.error("user with email Admin@example.com is not found")
        }
    }
}

export default UsersSeeders