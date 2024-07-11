const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
    const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.11');
    try {
        await client.connect();
        const db = client.db('myflix');
        const movieIds = await db.collection('movies').find({}, { projection: { _id: 1 } }).toArray();
        const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf8'));
        users.forEach(user => {
            user.birthday = new Date(user.birthday);
            for (let i = 0; i < 3; i++) {
                user.favourites.push(movieIds[Math.floor(Math.random() * movieIds.length)]._id);
            }
        });
        await db.collection('users').insertMany(users);
    } finally {
        client.close();
    }
}
main().catch(console.error);