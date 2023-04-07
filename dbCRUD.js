const dbSetup = require('./dbSetup')
const dbType = process.env.DBTYPE || 'array'

async function createUser(name, email, password, _array) {
    let success = false
    _array.push({
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password
    })
    // console.log('Create User array: ' + _array)
    switch (dbType) {
        case 'array':
            return _array;
            break;
        case 'sqlite3':
            try{
                const db = await dbSetup.connectDB()
                const sql = `Insert into USERS (name,email,pass) VALUES (?, ?, ?)`
                db.run(sql, [name, email, password], (err) => {
                    if (err != null) {
                        console.log('Run failed? ' + err);
                    }
                    else {
                        success = true;
                    }
                })
            }
            catch(err) {
                console.error(`Error writing to db: ${err}`)
            }
            break;
        case 'mysql': 
            console.log('Feature not yet implemented')
        default:
            break;
    }
    return success
}

async function readUsers() {
    const db = await dbSetup.connectDB()
    const dbPromise = () => {
        return new Promise((res, rej) => {
            db.all('SELECT * from users', (error, results) => {
                if(error != null) {
                    return rej(error)
                }
                else if(results.length > 0){
                    return res(results)
                }
                else {
                    return rej('No users')
                }
            })
        })
    }
    try {
        const users = await dbPromise()
        console.log(users)
        return users
    } 
    catch (e) {
        console.log(e)
        return false
    }
}

async function searchUsersById(id) {
    try {
        const db = await dbSetup.connectDB()
        const dbPromise = () => {
            return new Promise((res, rej) => {
                db.all('SELECT * from users where uid = ? limit 1', [id], (error, results) => {
                    if(error != null) {
                        return rej(error)
                    }
                    else if(results.length > 0){
                        return res(results)
                    }
                    else {
                        return rej('No users')
                    }
                })
            })
        }
    
        const user = await dbPromise()
        console.log(user)
        return user
    } 
    catch (e) {
        console.log(e)
        return false
    }
}

async function searchUsersByEmail(email) {
    const db = await dbSetup.connectDB()
    const dbPromise = () => {
        return new Promise((res, rej) => {
            const sqlParams = [email]
            const sql = `SELECT * FROM users WHERE email = ? limit 1`
            const statement = db.prepare(sql)
            statement.all(sqlParams, (err, results) => {
                if(err != null) {
                    return rej(err)
                }
                else if(results != null && results.length > 0){
                    return res(results[0])
                }
                else {
                    return rej('No users')
                }
            })
        })
    }
    try {
        const user = await dbPromise()
        return user
    } 
    catch (err) {
        console.log('searchByEmail err: ' + err)
        return false
    }
}

exports.searchUsersById = searchUsersById
exports.searchUsersByEmail = searchUsersByEmail
exports.createUser = createUser
exports.readUsers = readUsers