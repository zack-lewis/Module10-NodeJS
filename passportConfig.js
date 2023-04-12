const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email)
            const failMSG = 'Username and/or Password may be incorrect. Please try again. '
            if(user == null || !user) {
                return done(null, false, { message: failMSG })
            }
            
            const passMatch = await bcrypt.compare(password, user.pass)
            if(passMatch == true) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: failMSG })
            }
        }
        catch(err) {
            return done('AuthUser: ' + err)
        }

    }

    passport.use(new LocalStrategy(
        {usernameField: 'email'}, 
        authenticateUser
    ))

    passport.serializeUser((user,done) => {
        return done(null, user)
    })
    
    passport.deserializeUser((user,done) => {
        return done(null, getUserById(user.uid))
    })
}

exports.initialize = initialize