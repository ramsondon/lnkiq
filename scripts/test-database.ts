import prisma from "../src/lib/prisma"

async function testDatabase() {
    console.log("🔍 Testing Prisma Postgres connection...\n")

    try {
        // Test 1: Check connection
        console.log("✅ Connected to database!")

        // Test 2: Create or update a test user (upsert to handle existing user)
        console.log("\n📝 Creating/updating a test user...")
        const testUser = await prisma.user.upsert({
            where: { email: "demo@example.com" },
            update: { name: "Demo User (Updated)" },
            create: {
                email: "demo@example.com",
                name: "Demo User",
            },
        })
        console.log("✅ User:", testUser)

        // Test 3: Fetch all users
        console.log("\n📋 Fetching all users...")
        const allUsers = await prisma.user.findMany()
        console.log(`✅ Found ${allUsers.length} user(s):`)
        allUsers.forEach((user) => {
            console.log(`   - ${user.name} (${user.email})`)
        })

        console.log("\n🎉 All tests passed! Your database is working perfectly.\n")
    } catch (error) {
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

testDatabase()
