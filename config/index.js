const path = require('path')
const propertiesReader = require('properties-reader')

const iniFilePath = path.join(__dirname, './app.ini')
let props;
try {
    props = propertiesReader(iniFilePath)
} catch (err) {
    console.log(`Properties file not found. Create the following ini file your own values: ${iniFilePath}`)
}

const config = {
    baseUrl: prop('app.baseUrl') || 'http://localhost',
    port: prop('app.port') || 3000,
    admins: propArray('app.admins') || [],
    twitch: {
        clientID: prop('twitch.clientID') || '',
        clientSecret: prop('twitch.clientSecret') || ''
    },
    session: {
        secret: prop('app.sessionSecret') || 'coolCasbotSessionSecret'
    }

}

function prop(prop) {
    return props ? props.get(prop) : undefined
}

function propArray(prop) {
    let myProp = props ? props.get(prop) : undefined
    if (!myProp)
        return []

    myProp = typeof myProp === 'string' ? myProp : myProp.toString()

    const delim = ','
    return myProp.includes(delim) ? myProp.toString().split(delim) : [myProp]
}

module.exports = config