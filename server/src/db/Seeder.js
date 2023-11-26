/* eslint-disable no-console */
import { connection } from "../boot.js"
import VideoLinkSeeder from "./seeders/videoLinkSeeder.js"

class Seeder {
  static async seed() {
    // include individual seed commands here

    console.log("Seeding VideoLinks...")
    await VideoLinkSeeder.seed()
    
    console.log("Done!")
    await connection.destroy()
  }
}

export default Seeder