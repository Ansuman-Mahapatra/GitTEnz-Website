// Quick Fix: Update Admin Email in MongoDB
// This script updates the admin user's email to match the .env configuration

// Option 1: Using MongoDB Compass
// 1. Open MongoDB Compass
// 2. Connect to: mongodb+srv://db:0747@cluster0.lt4zjuc.mongodb.net/gitten
// 3. Navigate to: gitten database → users collection
// 4. Find document where username = "admin"
// 5. Edit the "email" field to: ansuman197463@gmail.com
// 6. Click Update

// Option 2: Using MongoDB Shell
// Run this command:
// mongosh "mongodb+srv://db:0747@cluster0.lt4zjuc.mongodb.net/gitten"
// Then paste this:

db.users.updateOne(
    { username: "admin" },
    { $set: { email: "ansuman197463@gmail.com" } }
)

// Verify the update:
db.users.findOne({ username: "admin" }, { email: 1, username: 1, role: 1 })

// Expected output:
// {
//   _id: ObjectId("..."),
//   username: "admin",
//   email: "ansuman197463@gmail.com",
//   role: "ADMIN"
// }
