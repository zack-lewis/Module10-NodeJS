const sqlite = require('sqlite3').verbose()
const dbfile = process.env.DB || './database.sqlite3'

// -------------
// FUNCTIONS
// -------------

async function createDBSchema() {
    try {
        // create table structure
        const db = await connectDB(dbfile)
        const dbSchemaSQL = `create table users (
            uid integer primary key autoincrement,
            name text not null,
            pass password not null, 
            email text not null unique,
            wins int DEFAULT 0,
            losses int DEFAULT 0,
            ties int DEFAULT 0
        )`;
        await db.run(dbSchemaSQL, (res, err) => {
            if(err != null){
                console.log(err)
                return false
            }
        })
        db.close()
        
        const recheck = await checkSchema()
        return recheck
    } 
    catch (e) {
        console.log('DB Creation Failed: ' + e)
        return false
    }
}

async function checkDBRW() {
    const tmp = new sqlite.Database(dbfile, (err) => {
        // if database file does not allow opening for read and write, error out
        if(err && err.code == "SQLITE_CANTOPEN") {
            console.log('Unable to open file for read/write access')
            return false
        }
        else if (err) {
            console.log('General error: ' + err)
            process.exit(1)
        }
    })
    tmp.close()
    return true
}

async function checkSchema() {
    // console.log('Checking DB Schema')
    try {
        const db = await connectDB()
        const found = await new Promise((res, rej) =>{        
            db.all(`select name from sqlite_master where type='table' and name='users'`, (err, rows) => {
                if(err != null) {
                    console.log('Err: ' + err)
                    rej(err)
                }
                else {
                    if(rows.length > 0) {
                        res(true)
                    }
                    else {
                        res(false)
                    }
                }
            })
        })
        
        db.close();
        return found;
    } 
    catch (e) {
        console.log(e)
        rej(e)
    }
};

async function connectDB() {
    const db = new sqlite.Database(dbfile, (err) => {
        if(err != null) {
            console.log('Attempt to open DB for R/W failed: ' + err)
            return false
        }
    });
    return db
};

// -------------
// MAIN THREAD
// -------------

async function init() {
    const dbStatus = await checkDBRW()
    // console.log(`Open DB: ${dbStatus}`)
    if(dbStatus == false){
        process.exit(1)
    }
    const schemaStatus = await checkSchema()
    // console.log(`Schema Up-to-Date: ${schemaStatus}`)

    if(schemaStatus === false) {
        const updateStatus = await createDBSchema()
        // console.log(`Schema Update Apply: ${updateStatus}`)
    }

    // console.log('Database ready for use')
}



exports.dbInit = init
exports.connectDB = connectDB