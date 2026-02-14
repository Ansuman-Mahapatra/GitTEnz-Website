// MongoDB Script to Update Admin Email
// Run this in MongoDB Compass or MongoDB Shell

// Connect to your database
use gitten

// Update the admin user's email
db.users.updateOne(
    { username: "admin" },
    { $set: { email: "23cse522.ansumanmahpatra@giet.edu" } }
)

// Verify the update
db.users.findOne({ username: "admin" }, { email: 1, username: 1, role: 1 })
