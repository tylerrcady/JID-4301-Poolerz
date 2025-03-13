const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const uri = "mongodb+srv://tylercadyfairport:poolerzPassword@poolerz-cluster0.oo7rq.mongodb.net/poolerz?retryWrites=true&w=majority&appName=Poolerz-Cluster0";
const dbName = 'poolerz';
const ownerId = new ObjectId('672109502dfd2e9df995270f');

// this script is used to seed the database with test carpools (and corresponding test data)
// It is not used in the production environment.
// For instructions on how to run this script, see the comment at the bottom of the file



async function processCarpoolTestData(data, client, db) {
    console.log(`Processing carpool: ${data.carpoolName}`);
    
    try {
        const testUsersMap = {};
        data.users.forEach(user => {
            testUsersMap[user.userId] = new ObjectId();
        });
        console.log(`Generated ObjectIds for ${data.users.length} users`);

        const userOps = data.users.map(user => ({
            updateOne: {
                filter: { email: `${user.name.replace(/\s+/g, '.').toLowerCase()}@example.com` },
                update: {
                    $setOnInsert: {
                        _id: testUsersMap[user.userId],
                        name: user.name,
                        email: `${user.name.replace(/\s+/g, '.').toLowerCase()}@example.com`,
                        image: "https://example.com/placeholder.jpg",
                        emailVerified: null
                    }
                },
                upsert: true
            }
        }));
        console.log(`Adding ${userOps.length} users to database...`);
        const userResult = await db.collection('users').bulkWrite(userOps);
        console.log(`User results: ${JSON.stringify(userResult.result || userResult)}`);

        const userDataOps = data.users.map(user => ({
            updateOne: {
                filter: { userId: testUsersMap[user.userId].toString() },
                update: {
                    $setOnInsert: {
                        _id: new ObjectId(),
                        userId: testUsersMap[user.userId].toString(),
                        userFormData: {
                            numChildren: user.numchildren,
                            children: user.children.map(name => ({ name })),
                            carCapacity: user.carCapacity,
                            availabilities: [],
                            location: user.location
                        },
                        isFormComplete: true
                    }
                },
                upsert: true
            }
        }));
        console.log(`Adding ${userDataOps.length} user-data entries...`);
        const userDataResult = await db.collection('user-data').bulkWrite(userDataOps);
        console.log(`User-data results: ${JSON.stringify(userDataResult.result || userDataResult)}`);

        const userCarpoolDataOps = data.users.map(user => {
            const availability = data.availabilities.find(a => a.userId === user.userId);
            return {
                updateOne: {
                    filter: { userId: testUsersMap[user.userId].toString() },
                    update: {
                        $setOnInsert: {
                            _id: new ObjectId(),
                            userId: testUsersMap[user.userId].toString(),
                            userData: {
                                userLocation: user.location,
                                carpools: [{
                                    carpoolId: data.carpoolId,
                                    riders: user.children,
                                    notes: "",
                                    drivingAvailability: availability ? availability.availability : [],
                                    carCapacity: user.carCapacity
                                }]
                            }
                        }
                    },
                    upsert: true
                }
            };
        });
        console.log(`Adding ${userCarpoolDataOps.length} user-carpool-data entries...`);
        const userCarpoolResult = await db.collection('user-carpool-data').bulkWrite(userCarpoolDataOps);
        console.log(`User-carpool-data results: ${JSON.stringify(userCarpoolResult.result || userCarpoolResult)}`);

        const carpoolMembers = data.users.map(user => testUsersMap[user.userId].toString());
        carpoolMembers.push(ownerId.toString());

        console.log(`Adding carpool ${data.carpoolId}...`);
        const carpoolResult = await db.collection('carpools').updateOne(
            { carpoolID: data.carpoolId },
            {
                $setOnInsert: {
                    _id: new ObjectId(),
                    carpoolID: data.carpoolId,
                    createCarpoolData: {
                        creatorId: ownerId.toString(),
                        carpoolName: data.carpoolName,
                        carpoolLocation: data.carpoolLocation,
                        carpoolDays: data.carpoolDays,
                        notes: `Times: M-F: 04:00. Additional Notes: ${data.carpoolName} activities`,
                        carpoolMembers: carpoolMembers
                    }
                }
            },
            { upsert: true }
        );
        console.log(`Carpool result: ${JSON.stringify(carpoolResult.result || carpoolResult)}`);

        console.log(`Looking up owner data for ${ownerId}...`);
        const ownerUserData = await db.collection('user-data').findOne({ userId: ownerId.toString() });
        console.log(`Owner user data found: ${ownerUserData ? 'yes' : 'no'}`);
        
        let ownerCarpoolData = await db.collection('user-carpool-data').findOne({ userId: ownerId.toString() });
        console.log(`Owner carpool data found: ${ownerCarpoolData ? 'yes' : 'no'}`);
        
        const newEntry = {
            carpoolId: data.carpoolId,
            riders: ownerUserData?.userFormData?.children?.map(c => c.name) || ["Child1", "Child2"],
            notes: "",
            drivingAvailability: data.carpoolDays,
            carCapacity: ownerUserData?.userFormData?.carCapacity || 4
        };

        if (!ownerCarpoolData) {
            console.log(`Creating new owner carpool data document...`);
            const result = await db.collection('user-carpool-data').insertOne({
                _id: new ObjectId(),
                userId: ownerId.toString(),
                userData: {
                    userLocation: ownerUserData?.userFormData?.location || {
                        address: "11 Old Country Lane",
                        city: "Fairport",
                        state: "NY",
                        zipCode: "14450"
                    },
                    carpools: [newEntry]
                }
            });
            console.log(`Insert result: ${JSON.stringify(result.result || result)}`);
        } else {
            const existingCarpool = ownerCarpoolData.userData.carpools.find(c => c.carpoolId === data.carpoolId);
            
            if (!existingCarpool) {
                console.log(`Adding carpool to owner's existing carpools...`);
                const result = await db.collection('user-carpool-data').updateOne(
                    { userId: ownerId.toString() },
                    { $push: { "userData.carpools": newEntry } }
                );
                console.log(`Update result: ${JSON.stringify(result.result || result)}`);
            } else {
                console.log(`Carpool already exists in owner's carpools.`);
            }
        }
        
        console.log(`Completed processing ${data.carpoolName}`);
    } catch (error) {
        console.error(`Error processing carpool ${data.carpoolName}:`, error);
        throw error;
    }
}

async function seedDatabase() {
    let client;
    
    try {
        console.log('Connecting to MongoDB...');
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        
        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collections in database ${dbName}:`);
        collections.forEach(c => console.log(` - ${c.name}`));

        console.log('Reading JSON files...');
        const jsonPaths = {
            test1: path.join(process.cwd(), 'public', 'test_data1.json'),
            test2: path.join(process.cwd(), 'public', 'test_data2.json'),
            test3: path.join(process.cwd(), 'public', 'test_data3.json'),
            test4: path.join(process.cwd(), 'public', 'test_data4.json')
        };
        
        console.log('File paths:');
        Object.entries(jsonPaths).forEach(([key, path]) => {
            console.log(` - ${key}: ${path}`);
        });
        
        let testData1, testData2, testData3, testData4;
        
        try {
            const file1Content = await fs.readFile(jsonPaths.test1, 'utf8');
            console.log(`File 1 read, size: ${file1Content.length} bytes`);
            testData1 = JSON.parse(file1Content);
            console.log(`File 1 parsed successfully: ${testData1.carpoolName}`);
        } catch (err) {
            console.error('Error reading/parsing test_data1.json:', err);
            throw err;
        }
        
        try {
            const file2Content = await fs.readFile(jsonPaths.test2, 'utf8');
            console.log(`File 2 read, size: ${file2Content.length} bytes`);
            testData2 = JSON.parse(file2Content);
            console.log(`File 2 parsed successfully: ${testData2.carpoolName}`);
        } catch (err) {
            console.error('Error reading/parsing test_data2.json:', err);
            throw err;
        }
        
        try {
            const file3Content = await fs.readFile(jsonPaths.test3, 'utf8');
            console.log(`File 3 read, size: ${file3Content.length} bytes`);
            testData3 = JSON.parse(file3Content);
            console.log(`File 3 parsed successfully: ${testData3.carpoolName}`);
        } catch (err) {
            console.error('Error reading/parsing test_data3.json:', err);
            throw err;
        }
        
        try {
            const file4Content = await fs.readFile(jsonPaths.test4, 'utf8');
            console.log(`File 4 read, size: ${file4Content.length} bytes`);
            testData4 = JSON.parse(file4Content);
            console.log(`File 4 parsed successfully: ${testData4.carpoolName}`);
        } catch (err) {
            console.error('Error reading/parsing test_data4.json:', err);
            throw err;
        }
        
        testData4.carpoolId = "004";
        console.log(`Updated testData4 carpoolId to ${testData4.carpoolId}`);
        
        await processCarpoolTestData(testData1, client, db);
        await processCarpoolTestData(testData2, client, db);
        await processCarpoolTestData(testData3, client, db);
        await processCarpoolTestData(testData4, client, db);
        
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

seedDatabase();

// How to run the script:

// First make sure you are in JDA-4301-Poolerz\my-app> then run following cmds
// run: node public/seed-test-carpools.js
// The current uri should be fine as is but note I got it from my .env.local file