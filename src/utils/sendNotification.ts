import dotenv from 'dotenv'
import { ServiceAccount, initializeApp } from 'firebase-admin/app'
import admin from 'firebase-admin'
import { Message, getMessaging } from 'firebase-admin/messaging'

// Configures the environment variables
dotenv.config()

const { 
    TYPE,
    PROJECT_ID,
    PRIVATE_KEY_ID,
    PRIVATE_KEY,
    CLIENT_EMAIL,
    CLIENT_ID,
    AUTH_URI,
    TOKEN_URI,
    AUTH_CERT_URL,
    CLIENT_CERT_URL,
    UNIVERSE_DOMAIN
} = process.env

if (
    !TYPE 
    || !PROJECT_ID 
    || !PRIVATE_KEY_ID 
    || !PRIVATE_KEY 
    || !CLIENT_EMAIL
    || !CLIENT_ID
    || !AUTH_URI 
    || !TOKEN_URI 
    || !AUTH_CERT_URL 
    || !CLIENT_CERT_URL
    || !UNIVERSE_DOMAIN
) {
    throw new Error('Missing essential environment variables in serviceAccount.')
}

type sendNotificationProps = {
    title: string
    description: string
    screen?: DetailedEvent | EventWithOnlyID
    topic?: string
}

// A new type that is the same as DetailedEvent, but with id as a string
interface DetailedEventStr extends Omit<DetailedEvent, "id"> {
    id: string
}

// Data in the message cannot be undefined so it is defined as an empty object or a DetailedEventStr
type Data = {} | DetailedEventStr

// Initialize the Firebase Admin SDK with the service account
const app = initializeApp({
    credential: admin.credential.cert({
        type: TYPE,
        project_id: PROJECT_ID,
        private_key_id: PRIVATE_KEY_ID,
        private_key: PRIVATE_KEY,
        client_email: CLIENT_EMAIL,
        client_id: CLIENT_ID,
        auth_uri: AUTH_URI,
        token_uri: TOKEN_URI,
        auth_provider_x509_cert_url: AUTH_CERT_URL,
        client_x509_cert_url: CLIENT_CERT_URL,
        universe_domain: UNIVERSE_DOMAIN
    } as ServiceAccount)
})

/**
 * Posts notification to FCM.
 * @param title    Notification title
 * @param body     Notification body
 * @param screen   Event to navigate to in the app, give the full object.
 * @param topic    Notification topic
 */
export default async function sendNotification({title, description, screen, topic}: sendNotificationProps): Promise<boolean> {
    // Sets the topic to maintenance if the topic is not available
    if (!topic) {
        topic = "maintenance"
    }

    // Provide screen as data parameter if the id is defined
    const data: Data = screen && screen.id ? screen : {}
    
    // Defines the message to be sent
    const message: Message = {
        topic: topic,
        notification: {
            title: title,
            body: description,
        },
        data: data
    }
    
    // Sends the message
    try {
        const notification = await getMessaging().send(message)
        
        if (notification) {
            return true
        }
    } catch (error) {
        return false
    }

    return false
}

// Examples of direct notifications that can be sent by node sendNotifications.ts
// Topics: norwegianTOPIC, englishTOPIC, ...

// sendNotification({title: "Tittel", description: "Beskrivelse", topic: "maintenance"})
