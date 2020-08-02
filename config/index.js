const path = require('path')
const propertiesReader = require('properties-reader')

const iniFilePath = path.join(__dirname, './app.ini')
let props;
try {
    props = propertiesReader(iniFilePath)
} catch(err) {
    console.log(`Properties file not found. Create the following ini file your own values: ${iniFilePath}`)
}

const config = {
    baseUrl: prop('app.baseUrl') || 'http://localhost',
    port: prop('app.port') || 3000,
    admin: prop('app.admin') || '',
    twitch: {
        clientID: prop('twitch.clientID') || '',
        clientSecret: prop('twitch.clientID') || ''
    },
    session: {
        secret: prop('app.sessionSecret') || 'coolCasbotSessionSecret'
    }
    
}

function prop(prop) {
    return props ? props.get(prop) : undefined
}

module.exports = config