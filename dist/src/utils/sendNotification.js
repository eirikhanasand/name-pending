import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
const app = initializeApp({
    credential: applicationDefault()
});
/**
 * Posts notification to FCM.
 * @param title    Notification title
 * @param body     Notification body
 * @param screen   Event to navigate to in the app, give the full object.
 * @param topic    Notification topic
 */
export default async function sendNotification({ title, description, screen, topic }) {
    // Sets the topic to maintenance if the topic is not available
    if (!topic) {
        topic = "maintenance";
    }
    // Provide screen as data parameter if the id is defined
    const data = screen && screen.id ? screen : {};
    // Defines the message to be sent
    const message = {
        topic: topic,
        notification: {
            title: title,
            body: description,
        },
        data: data
    };
    // Sends the message
    try {
        const notification = await getMessaging().send(message);
        if (notification) {
            return true;
        }
    }
    catch (error) {
        return false;
    }
    return false;
}
// Examples of direct notifications that can be sent by node sendNotifications.ts
// Topics: norwegianTOPIC, englishTOPIC, ...
// sendNotification({title: "Tittel", description: "Beskrivelse", topic: "maintenance"})
